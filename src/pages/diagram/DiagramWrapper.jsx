import React, { useEffect } from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

export const DiagramWrapper = ({
  diagramRef,
  nodeDataArray,
  linkDataArray,
  onDiagramEvent,
  onModelChange,
}) => {
  const LinePrefix = 20;
  const LineSuffix = 30;
  const MessageSpacing = 20;
  const ActivityWidth = 10;
  const ActivityStart = 5;
  const ActivityEnd = 5;

  useEffect(() => {
    if (!diagramRef.current) return;

    const diagram = diagramRef.current.getDiagram();

    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener("ChangedSelection", onDiagramEvent);
    }

    return () => {
      if (diagram instanceof go.Diagram) {
        diagram.removeDiagramListener("ChangedSelection", onDiagramEvent);
      }
    };
  }, [onDiagramEvent]);

  const initDiagram = () => {
    function computeLifelineHeight(duration) {
      return LinePrefix + duration * MessageSpacing + LineSuffix;
    }

    function computeActivityLocation(act) {
      const groupdata = diagram.model.findNodeDataForKey(act.group);
      if (groupdata === null) return new go.Point();
      const grouploc = go.Point.parse(groupdata.loc);
      return new go.Point(
        grouploc.x,
        convertTimeToY(act.start) - ActivityStart
      );
    }

    function backComputeActivityLocation(loc, act) {
      diagram.model.setDataProperty(
        act,
        "start",
        convertYToTime(loc.y + ActivityStart)
      );
    }

    function computeActivityHeight(duration) {
      return ActivityStart + duration * MessageSpacing + ActivityEnd;
    }

    function backComputeActivityHeight(height) {
      return (height - ActivityStart - ActivityEnd) / MessageSpacing;
    }

    function convertTimeToY(t) {
      return t * MessageSpacing + LinePrefix;
    }

    function convertYToTime(y) {
      return (y - LinePrefix) / MessageSpacing;
    }

    function ensureLifelineHeights() {
      const arr = diagram.model.nodeDataArray;
      let max = -1;
      for (let i = 0; i < arr.length; i++) {
        const act = arr[i];
        if (act.isGroup) continue;
        max = Math.max(max, act.start + act.duration);
      }
      if (max > 0) {
        for (let i = 0; i < arr.length; i++) {
          const gr = arr[i];
          if (!gr.isGroup) continue;
          if (max > gr.duration) {
            diagram.model.setDataProperty(gr, "duration", max);
          }
        }
      }
    }

    class MessageLink extends go.Link {
      constructor() {
        super();
        this.time = 0;
      }

      getLinkPoint(node, port, spot, from, ortho, othernode, otherport) {
        const p = port.getDocumentPoint(go.Spot.Center);
        const r = port.getDocumentBounds();
        const op = otherport.getDocumentPoint(go.Spot.Center);

        const data = this.data;
        const time = data !== null ? data.time : this.time;

        const aw = this.findActivityWidth(node, time);
        const x = op.x > p.x ? p.x + aw / 2 : p.x - aw / 2;
        const y = convertTimeToY(time);
        return new go.Point(x, y);
      }

      findActivityWidth(node, time) {
        let aw = ActivityWidth;
        if (node instanceof go.Group) {
          if (
            !node.memberParts.any((mem) => {
              const act = mem.data;
              return (
                act !== null &&
                act.start <= time &&
                time <= act.start + act.duration
              );
            })
          ) {
            aw = 0;
          }
        }
        return aw;
      }

      getLinkDirection(
        node,
        port,
        linkpoint,
        spot,
        from,
        ortho,
        othernode,
        otherport
      ) {
        const p = port.getDocumentPoint(go.Spot.Center);
        const op = otherport.getDocumentPoint(go.Spot.Center);
        const right = op.x > p.x;
        return right ? 0 : 180;
      }

      computePoints() {
        if (this.fromNode === this.toNode) {
          const data = this.data;
          const time = data !== null ? data.time : this.time;
          const p = this.fromNode.port.getDocumentPoint(go.Spot.Center);
          const aw = this.findActivityWidth(this.fromNode, time);

          const x = p.x + aw / 2;
          const y = convertTimeToY(time);
          this.clearPoints();
          this.addPoint(new go.Point(x, y));
          this.addPoint(new go.Point(x + 50, y));
          this.addPoint(new go.Point(x + 50, y + 5));
          this.addPoint(new go.Point(x, y + 5));
          return true;
        } else {
          return super.computePoints();
        }
      }
    }

    class MessagingTool extends go.LinkingTool {
      constructor() {
        super();

        const $ = go.GraphObject.make;
        this.temporaryLink = $(
          MessageLink,
          $(go.Shape, "Rectangle", { stroke: "magenta", strokeWidth: 2 }),
          $(go.Shape, { toArrow: "OpenTriangle", stroke: "magenta" })
        );
      }

      doActivate() {
        super.doActivate();
        const time = convertYToTime(this.diagram.firstInput.documentPoint.y);
        this.temporaryLink.time = Math.ceil(time);
      }

      insertLink(fromnode, fromport, tonode, toport) {
        const newlink = super.insertLink(fromnode, fromport, tonode, toport);
        if (newlink !== null) {
          const model = this.diagram.model;
          const start = this.temporaryLink.time;
          const duration = 1;
          newlink.data.time = start;
          model.setDataProperty(newlink.data, "text", "mensaje");

          const newact = {
            group: newlink.data.to,
            start: start,
            duration: duration,
          };

          model.addNodeData(newact);
          ensureLifelineHeights();
        }
        return newlink;
      }
    }

    class MessageDraggingTool extends go.DraggingTool {
      computeEffectiveCollection(parts, options) {
        const result = super.computeEffectiveCollection(parts, options);
        result.add(new go.Node(), new go.DraggingInfo(new go.Point()));
        parts.each((part) => {
          if (part instanceof go.Link) {
            result.add(part, new go.DraggingInfo(part.getPoint(0).copy()));
          }
        });
        return result;
      }

      mayMove() {
        return !this.diagram.isReadOnly && this.diagram.allowMove;
      }

      moveParts(parts, offset, check) {
        super.moveParts(parts, offset, check);
        const it = parts.iterator;
        while (it.next()) {
          if (it.key instanceof go.Link) {
            const link = it.key;
            const startY = it.value.point.y;
            let y = startY + offset.y;
            const cellY = this.gridSnapCellSize.height;
            y = Math.round(y / cellY) * cellY;
            const t = Math.max(0, convertYToTime(y));
            link.diagram.model.set(link.data, "time", t);
            link.invalidateRoute();
          }
        }
      }
    }

    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, {
      allowCopy: false,
      linkingTool: $(MessagingTool),
      "resizingTool.isGridSnapEnabled": true,
      draggingTool: $(MessageDraggingTool),
      "draggingTool.gridSnapCellSize": new go.Size(1, MessageSpacing / 4),
      "draggingTool.isGridSnapEnabled": true,
      SelectionMoved: ensureLifelineHeights,
      PartResized: ensureLifelineHeights,
      "undoManager.isEnabled": true,
      model: new go.GraphLinksModel({
        linkKeyProperty: "key",
      }),
    });

    diagram.groupTemplate = $(
      go.Group,
      "Vertical",
      {
        locationSpot: go.Spot.Bottom,
        locationObjectName: "HEADER",
        minLocation: new go.Point(0, 0),
        maxLocation: new go.Point(9999, 0),
        selectionObjectName: "HEADER",
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      $(
        go.Panel,
        "Auto",
        { name: "HEADER" },
        $(go.Shape, "Rectangle", {
          fill: $(go.Brush, "Linear", {
            0: "#bbdefb",
            1: go.Brush.darkenBy("#bbdefb", 0.1),
          }),
          stroke: null,
        }),
        $(
          go.TextBlock,
          {
            margin: 5,
            font: "400 10pt Source Sans Pro, sans-serif",
          },
          new go.Binding("text", "text")
        )
      ),
      $(
        go.Shape,
        {
          figure: "LineV",
          fill: null,
          stroke: "gray",
          strokeDashArray: [3, 3],
          width: 1,
          alignment: go.Spot.Center,
          portId: "",
          fromLinkable: true,
          fromLinkableDuplicates: true,
          toLinkable: true,
          toLinkableDuplicates: true,
          cursor: "pointer",
        },
        new go.Binding("height", "duration", computeLifelineHeight)
      )
    );

    diagram.nodeTemplate = $(
      go.Node,
      {
        locationObjectName: "SHAPE",
        minLocation: new go.Point(NaN, LinePrefix - ActivityStart),
        maxLocation: new go.Point(NaN, 19999),
        selectionObjectName: "SHAPE",
        resizable: true,
        resizeObjectName: "SHAPE",
        resizeAdornmentTemplate: $(
          go.Adornment,
          "Spot",
          $(go.Placeholder),
          $(go.Shape, {
            alignment: go.Spot.Bottom,
            cursor: "col-resize",
            desiredSize: new go.Size(6, 6),
            fill: "yellow",
          })
        ),
      },
      new go.Binding("location", "", computeActivityLocation).makeTwoWay(
        backComputeActivityLocation
      ),
      $(
        go.Shape,
        "Rectangle",
        {
          name: "SHAPE",
          fill: "white",
          stroke: "black",
          width: ActivityWidth,
          minSize: new go.Size(ActivityWidth, computeActivityHeight(0.25)),
        },
        new go.Binding("height", "duration", computeActivityHeight).makeTwoWay(
          backComputeActivityHeight
        )
      )
    );

    diagram.linkTemplate = $(
      MessageLink,
      { selectionAdorned: true, curviness: 0 },
      $(go.Shape, "Rectangle", { stroke: "black" }),
      $(go.Shape, { toArrow: "OpenTriangle", stroke: "black" }),
      $(
        go.TextBlock,
        {
          font: "400 9pt Source Sans Pro, sans-serif",
          segmentIndex: 0,
          segmentOffset: new go.Point(NaN, NaN),
          isMultiline: false,
          editable: true,
        },
        new go.Binding("text", "text").makeTwoWay()
      )
    );

    return diagram;
  };

  return (
    <ReactDiagram
      ref={diagramRef}
      divClassName="diagram-component"
      initDiagram={initDiagram}
      nodeDataArray={nodeDataArray}
      linkDataArray={linkDataArray}
      onModelChange={onModelChange}
    />
  );
};

export default DiagramWrapper;

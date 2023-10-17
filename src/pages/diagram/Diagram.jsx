import * as go from "gojs";
import { useEffect, useRef, useState } from "react";
import { DiagramWrapper } from "@/pages/diagram";
import { DiagramProvider, useDiagramContext } from "@/context/diagramContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/configs/firebase/credential";
import { nameDoc } from "@/configs/firebase/nameDoc";

export const initialData = {
  nodeDataArray: [],
  linkDataArray: [],
};

export function Diagram() {
  const [data, setData] = useState(initialData);
  const [nextNodeX, setNextNodeX] = useState(400);
  const diagramRef = useRef(null);
  const { selectedDiagram, setSelectedDiagram } =
    useDiagramContext(DiagramProvider);

  // Recuperar selectedDiagram desde localStorage al cargar la página
  useEffect(() => {
    const storedSelectedDiagram = localStorage.getItem("selectedDiagram");
    if (storedSelectedDiagram) {
      setSelectedDiagram(storedSelectedDiagram);
    }
  }, [setSelectedDiagram]);

  const getDiagram = async () => {
    try {
      const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
      const diagramSnap = await getDoc(diagramRef);

      if (diagramSnap.exists()) {
        const dataDiagram = diagramSnap.data();

        if (!dataDiagram.data) {
          dataDiagram.data = initialData;
        }

        setData(dataDiagram.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDiagram(); // Cargar datos desde Firebase al seleccionar un diagrama
  }, [selectedDiagram]);

  const addNode = () => {
    const newNode = {
      key: "newNode" + Date.now(),
      text: "New Node",
      isGroup: true,
      loc: `${nextNodeX} 0`,
      duration: 3,
    };

    const newNodeDataArray = [...data.nodeDataArray, newNode];

    setData({
      ...data,
      nodeDataArray: newNodeDataArray,
    });

    setNextNodeX(nextNodeX + 100);

    // Actualizar la colección de "diagrams" en Firestore
    const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
    updateDoc(diagramRef, {
      data: {
        nodeDataArray: newNodeDataArray,
        linkDataArray: data.linkDataArray,
      },
    });
  };

  const handleModelChange = (obj) => {
    if (diagramRef.current) {
      const model = diagramRef.current.getDiagram().model;

      if (model) {
        setData({
          ...data,
          nodeDataArray: model.nodeDataArray,
          linkDataArray: model.linkDataArray,
        });

        // Actualizar la colección de "diagrams" en Firestore
        const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
        updateDoc(diagramRef, {
          data: {
            nodeDataArray: model.nodeDataArray,
            linkDataArray: model.linkDataArray,
          },
        });
      }
    }

    console.log("Model changed:", obj);
  };

  const handleDiagramEvent = (e) => {};

  return (
    <div>
      <DiagramWrapper
        diagramRef={diagramRef}
        nodeDataArray={data.nodeDataArray}
        linkDataArray={data.linkDataArray}
        onDiagramEvent={handleDiagramEvent}
        onModelChange={handleModelChange}
      />
      <button onClick={addNode}>Add Node</button>
    </div>
  );
}

export default Diagram;

// import * as go from "gojs";
// import { useEffect, useRef, useState } from "react";
// import { DiagramWrapper } from "@/pages/diagram";
// import { DiagramProvider, useDiagramContext } from "@/context/diagramContext";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebase/credential";
// import { nameDoc } from "@/configs/firebase/nameDoc";

// export const initialData = {
//   nodeDataArray: [],
//   linkDataArray: [],
// };

// export function Diagram() {
//   const [data, setData] = useState(initialData);
//   const [nextNodeX, setNextNodeX] = useState(400);
//   const diagramRef = useRef(null);
//   const { selectedDiagram } = useDiagramContext(DiagramProvider);

//   const getDiagram = async () => {
//     try {
//       const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//       const diagramSnap = await getDoc(diagramRef);

//       if (diagramSnap.exists()) {
//         const dataDiagram = diagramSnap.data();

//         if (!dataDiagram.data) {
//           dataDiagram.data = initialData;
//         }

//         setData(dataDiagram.data);

//         // No es necesario almacenar selectedDiagram en localStorage
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getDiagram(); // Cargar datos desde Firebase al seleccionar un diagrama
//   }, [selectedDiagram]);

//   const addNode = () => {
//     const newNode = {
//       key: "newNode" + Date.now(),
//       text: "New Node",
//       isGroup: true,
//       loc: `${nextNodeX} 0`,
//       duration: 3,
//     };

//     const newNodeDataArray = [...data.nodeDataArray, newNode];

//     setData({
//       ...data,
//       nodeDataArray: newNodeDataArray,
//     });

//     setNextNodeX(nextNodeX + 100);

//     // Actualizar la colección de "diagrams" en Firestore
//     const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//     updateDoc(diagramRef, {
//       data: {
//         nodeDataArray: newNodeDataArray,
//         linkDataArray: data.linkDataArray,
//       },
//     });
//   };

//   const handleModelChange = (obj) => {
//     if (diagramRef.current) {
//       const model = diagramRef.current.getDiagram().model;

//       if (model) {
//         setData({
//           ...data,
//           nodeDataArray: model.nodeDataArray,
//           linkDataArray: model.linkDataArray,
//         });

//         // Actualizar la colección de "diagrams" en Firestore
//         const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//         updateDoc(diagramRef, {
//           data: {
//             nodeDataArray: model.nodeDataArray,
//             linkDataArray: model.linkDataArray,
//           },
//         });
//       }
//     }

//     console.log("Model changed:", obj);
//   };

//   const handleDiagramEvent = (e) => {};

//   return (
//     <div>
//       <DiagramWrapper
//         diagramRef={diagramRef}
//         nodeDataArray={data.nodeDataArray}
//         linkDataArray={data.linkDataArray}
//         onDiagramEvent={handleDiagramEvent}
//         onModelChange={handleModelChange}
//       />
//       <button onClick={addNode}>Add Node</button>
//     </div>
//   );
// }

// export default Diagram;

// import * as go from "gojs";
// import { useEffect, useRef, useState } from "react";
// import { DiagramWrapper } from "@/pages/diagram";
// import { DiagramProvider, useDiagramContext } from "@/context/diagramContext";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebase/credential";
// import { nameDoc } from "@/configs/firebase/nameDoc";

// export const initialData = {
//   nodeDataArray: [
//     // {
//     //   key: "Fred",
//     //   text: "Fred: Patron",
//     //   isGroup: true,
//     //   loc: "0 0",
//     //   duration: 9,
//     // },
//     // {
//     //   key: "Bob",
//     //   text: "Bob: Waiter",
//     //   isGroup: true,
//     //   loc: "100 0",
//     //   duration: 9,
//     // },
//     // {
//     //   key: "Hank",
//     //   text: "Hank: Cook",
//     //   isGroup: true,
//     //   loc: "200 0",
//     //   duration: 9,
//     // },
//     // {
//     //   key: "Renee",
//     //   text: "Renee: Cashier",
//     //   isGroup: true,
//     //   loc: "300 0",
//     //   duration: 9,
//     // },
//     // { group: "Bob", start: 1, duration: 2 },
//     // { group: "Hank", start: 2, duration: 3 },
//     // { group: "Fred", start: 3, duration: 1 },
//     // { group: "Bob", start: 5, duration: 1 },
//     // { group: "Fred", start: 6, duration: 2 },
//     // { group: "Renee", start: 8, duration: 1 },
//   ],
//   linkDataArray: [
//     // { from: "Fred", to: "Bob", text: "order", time: 1 },
//     // { from: "Bob", to: "Hank", text: "order food", time: 2 },
//     // { from: "Bob", to: "Fred", text: "serve drinks", time: 3 },
//     // { from: "Hank", to: "Bob", text: "finish cooking", time: 5 },
//     // { from: "Bob", to: "Fred", text: "serve food", time: 6 },
//     // { from: "Fred", to: "Renee", text: "pay", time: 8 },
//   ],
// };

// export function Diagram() {
//   const [data, setData] = useState(initialData);
//   const [nextNodeX, setNextNodeX] = useState(400);
//   const diagramRef = useRef(null);
//   const { selectedDiagram, setSelectedDiagram } =
//     useDiagramContext(DiagramProvider);

//   console.log("Seleccionado ", selectedDiagram);

//   const getDiagram = async () => {
//     try {
//       const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//       const diagramSnap = await getDoc(diagramRef);

//       if (diagramSnap.exists()) {
//         const dataDiagram = diagramSnap.data();

//         if (!dataDiagram.data) {
//           diagramSnap.data = initialData;
//         }

//         setData(dataDiagram.data);
//         // Almacena selectedDiagram en el localStorage al cargar el diagrama
//         localStorage.setItem("selectedDiagram", selectedDiagram);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // const getDiagram = async () => {
//   //   try {
//   //     const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//   //     const diagramSnap = await getDoc(diagramRef);

//   //     if (diagramSnap.exists()) {
//   //       const dataDiagram = diagramSnap.data();

//   //       console.log(dataDiagram);
//   //       if (!dataDiagram.data) {
//   //         diagramSnap.data = initialData;
//   //       }

//   //       setData(dataDiagram.data);
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // };

//   useEffect(() => {
//     const storedSelectedDiagram = localStorage.getItem("selectedDiagram");
//     if (storedSelectedDiagram) {
//       setSelectedDiagram(storedSelectedDiagram);
//     }
//   }, []);

//   useEffect(() => {
//     getDiagram(); // Cargar datos de fire base
//   }, []);

//   const addNode = () => {
//     const newNode = {
//       key: "newNode" + Date.now(),
//       text: "New Node",
//       isGroup: true,
//       loc: `${nextNodeX} 0`,
//       duration: 3,
//     };

//     const newNodeDataArray = [...data.nodeDataArray, newNode];

//     setData({
//       ...data,
//       nodeDataArray: newNodeDataArray,
//     });

//     setNextNodeX(nextNodeX + 100);

//     // Actualizar la colección de "diagrams" en Firestore
//     const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//     updateDoc(diagramRef, {
//       data: {
//         nodeDataArray: newNodeDataArray,
//         linkDataArray: data.linkDataArray,
//       },
//     });

//     // Actualizar el localStorage
//     const localStorageData = JSON.parse(localStorage.getItem(selectedDiagram));
//     localStorageData.data.nodeDataArray = newNodeDataArray;
//     localStorage.setItem(selectedDiagram, JSON.stringify(localStorageData));
//   };

//   const handleModelChange = (obj) => {
//     if (diagramRef.current) {
//       const model = diagramRef.current.getDiagram().model;

//       if (model) {
//         setData({
//           ...data,
//           nodeDataArray: model.nodeDataArray,
//           linkDataArray: model.linkDataArray,
//         });

//         // Actualizar la colección de "diagrams" en Firestore
//         const diagramRef = doc(db, nameDoc.DIAGRAMS, selectedDiagram);
//         updateDoc(diagramRef, {
//           data: {
//             nodeDataArray: model.nodeDataArray,
//             linkDataArray: model.linkDataArray,
//           },
//         });

//         // Actualizar el localStorage
//         const localStorageData = JSON.parse(
//           localStorage.getItem(selectedDiagram)
//         );

//         localStorageData.data.nodeDataArray = model.nodeDataArray;
//         localStorageData.data.linkDataArray = model.linkDataArray;
//         localStorage.setItem(selectedDiagram, JSON.stringify(localStorageData));
//       }
//     }

//     console.log("Model changed:", obj);
//   };

//   const handleDiagramEvent = (e) => {};

//   return (
//     <div>
//       <DiagramWrapper
//         diagramRef={diagramRef}
//         nodeDataArray={data.nodeDataArray}
//         linkDataArray={data.linkDataArray}
//         onDiagramEvent={handleDiagramEvent}
//         onModelChange={handleModelChange}
//       />
//       <button onClick={addNode}>Add Node</button>
//     </div>
//   );
// }

// export default Diagram;

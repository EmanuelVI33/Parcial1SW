import { db } from "@/configs/firebase/credential";
import { nameDoc } from "@/configs/firebase/nameDoc";
import { useDiagramData } from "@/hooks/diagram";
import { doc } from "firebase/firestore";
import { Link } from "react-router-dom";

export function Home() {
  const userRef = doc(db, nameDoc.USERS, "8AYTLPOIWaZ4mv8vrd0bLcVmFl72");

  const {
    showForm,
    diagramName,
    diagrams,
    editingDiagramIndex,
    editedDiagramNameRef,
    changedDiagramName,
    handleEditDiagram,
    handleCancel,
    handleDeleteDiagram,
    handleAddDiagram,
    handleSaveDiagramEdit,
    handleSaveDiagram,
  } = useDiagramData(db, userRef);

  return (
    <div className="mt-12 p-4">
      <h1 className="mb-4 text-3xl font-bold">Mis Diagramas</h1>

      <button
        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        onClick={handleAddDiagram}
      >
        Agregar Diagrama
      </button>

      {showForm && (
        <div className="mt-4 rounded border border-gray-300 p-4">
          <input
            type="text"
            placeholder="Nombre del Diagrama"
            className="w-full rounded border border-gray-300 p-2"
            value={diagramName}
            onChange={(e) => changedDiagramName(e.target.value)}
          />
          <div className="mt-2">
            <button
              className="rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600"
              onClick={handleSaveDiagram}
            >
              Guardar
            </button>
            <button
              className="ml-2 rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table className="mt-4 w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre del Diagrama</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(diagrams).map((diagramId, index) => (
            <tr key={diagramId}>
              <td className="border px-4 py-2">
                {index === editingDiagramIndex ? (
                  <input
                    type="text"
                    ref={editedDiagramNameRef}
                    // defaultValue se utiliza para establecer el valor inicial
                    defaultValue={diagrams[diagramId].name}
                  />
                ) : (
                  diagrams[diagramId].name
                )}
              </td>
              <td className="border px-4 py-2">
                {index === editingDiagramIndex ? (
                  <>
                    <button
                      onClick={() => handleSaveDiagramEdit(index)}
                      className="hover-bg-blue-600 rounded bg-blue-500 px-3 py-1 text-white"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="hover-bg-red-600 ml-2 rounded bg-red-500 px-3 py-1 text-white"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditDiagram(index)}
                    className="hover-bg-blue-600 rounded bg-blue-500 px-3 py-1 text-white"
                  >
                    Editar
                  </button>
                )}
              </td>
              <td className="border px-4 py-2">
                <Link to="/dashboard/diagrams">
                  <button
                    // onClick={() => handleDeleteDiagram(index)}
                    className="hover-bg-blue-600 mr-2 rounded bg-blue-500 py-1 px-3 text-white"
                  >
                    Visualizar
                  </button>
                </Link>
                <button
                  onClick={() => handleDeleteDiagram(index)}
                  className="hover-bg-red-600 rounded bg-red-500 px-3 py-1 text-white"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;

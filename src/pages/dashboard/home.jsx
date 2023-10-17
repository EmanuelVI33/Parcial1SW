import { db } from "@/configs/firebase/credential";
import { nameDoc } from "@/configs/firebase/nameDoc";
import { DiagramProvider, useDiagramContext } from "@/context/diagramContext";
import { UserProvider, userContext } from "@/context/userContext";
import { useDiagramData } from "@/hooks/diagram";
import { collection, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Typography,
  Input,
  Card,
  Checkbox,
} from "@material-tailwind/react";
import { InviteUserAlert } from "@/widgets/home/InviteUserAlert";

function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const TABLE_HEAD = ["Nombre", "Correo Electrónico", "Invitar"];

export function Home() {
  const { user } = userContext(UserProvider);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [selectedDiagramToInvite, setSelectedDiagramToInvite] = useState(null);
  const [isInviteAlertOpen, setIsInviteAlertOpen] = useState(false);

  const handleInviteClick = (diagramId) => {
    setSelectedDiagramToInvite(diagramId);
    setIsInviteAlertOpen(true);
  };

  const { selectedDiagram, setSelectedDiagram } =
    useDiagramContext(DiagramProvider);
  // useEffect(() => {
  //   if (!user) {
  //     console.log("No existe el user");
  //     navigate("/auth/sign-in");
  //   }
  // }, []);

  console.log(user);

  const id = user && user.id;
  const userDiagrams = user && user.diagrams;
  console.log(id);
  const userRef = doc(db, nameDoc.USERS, id);

  // const userRef = doc(db, nameDoc.USERS, "8AYTLPOIWaZ4mv8vrd0bLcVmFl72");

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
    handleSelectDiagram,
  } = useDiagramData(db, userRef, userDiagrams);

  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // const handleInviteUser = () => {
  //   if (selectedUser && selectedDiagramToInvite) {
  //     // Agrega el usuario seleccionado a la lista de invitados del diagrama
  //     const updatedDiagrams = { ...diagrams };
  //     updatedDiagrams[selectedDiagramToInvite].guests.push({
  //       name: selectedUser.name,
  //       email: selectedUser.email,
  //     });

  //     // Actualiza el estado de los diagramas
  //     setDiagrams(updatedDiagrams);
  //   }
  // };

  // const handleInviteUser = (user) => {
  //   // Maneja la lógica de invitación aquí
  //   // Agrega o quita usuarios de la lista de invitados según la selección
  //   if (selectedUsers.includes(user)) {
  //     setSelectedUsers((prev) =>
  //       prev.filter((selectedUser) => selectedUser !== user)
  //     );
  //   } else {
  //     setSelectedUsers((prev) => [...prev, user]);
  //   }
  // };

  // useEffect(() => {
  //   if (isInviteAlertOpen) {
  //     // Cuando se abre el Alert de invitación, obtén la lista de usuarios desde Firebase
  //     const fetchUsers = async () => {
  //       try {
  //         const userCollection = collection(db, nameDoc.USERS);
  //         const querySnapshot = await getDocs(userCollection);
  //         const users = [];
  //         querySnapshot.forEach((doc) => {
  //           const userData = doc.data();
  //           console.log(userData);
  //           users.push(userData);
  //         });
  //         setUserList(users);
  //       } catch (error) {
  //         console.error("Error al obtener la lista de usuarios:", error);
  //       }
  //     };

  //     fetchUsers();
  //   }
  // }, [isInviteAlertOpen]);

  return (
    <div className="mt-12 p-4">
      <h1 className="m-2 text-3xl font-bold">Mis Diagramas</h1>

      <Button
        variant="gradient"
        className="rounded-full"
        onClick={handleAddDiagram}
      >
        Agregar Diagrama
      </Button>

      {showForm && (
        <div className="mt-4 rounded border border-gray-300 p-4">
          <Input
            label="Nombre de Diagrama"
            value={diagramName}
            onChange={(e) => changedDiagramName(e.target.value)}
          />
          <div className="mt-4">
            <Button className="mr-2" color="green" onClick={handleSaveDiagram}>
              Guardar
            </Button>

            <Button color="red" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <table className="my-4 w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre del Diagrama</th>
            <th className="border px-4 py-2">Invitados</th>
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
              <td className="py-2 px-4">
                {diagrams[diagramId].guests.length > 0 ? (
                  diagrams[diagramId].guests.map((guest, index) => (
                    <p key={index}>{guest.name}</p>
                  ))
                ) : (
                  <p className="p-2">No hay invitados en este diagrama.</p>
                )}
                {/* <button
                  onClick={() => handleInviteClick(diagramId)}
                  className="hover-bg-blue-600 mx-2 rounded bg-blue-500 p-2 text-white"
                >
                  Invitar
                </button> */}
                <InviteUserAlert
                  data={{ diagramId, userRef }}
                  className="my-2"
                />
              </td>
              <td className="border px-4 py-2">
                {diagramId === editingDiagramIndex ? (
                  <>
                    <button
                      onClick={() => handleSaveDiagramEdit(diagramId)}
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
                    onClick={() => handleEditDiagram(diagramId)}
                    className="hover-bg-blue-600 rounded bg-blue-500 px-3 py-1 text-white"
                  >
                    Editar
                  </button>
                )}
              </td>
              <td className="border px-4 py-2">
                <Link to="/dashboard/diagrams">
                  <button
                    onClick={() => setSelectedDiagram(diagramId)}
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

      {selectedDiagramToInvite && <InviteUserAlert />}

      {/* {selectedDiagramToInvite && (
        <div className="mt-12 p-4">
          <Card className="h-full w-full overflow-scroll">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map(({ name, email }, index) => {
                  const isLast = index === userList.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={name}>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {name}
                        </Typography>
                      </td>
                      <td className={`${classes} bg-blue-gray-50/50`}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {email}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Checkbox
                          checked={selectedUsers.includes(name)} // Utiliza un identificador único en lugar de "name" si tienes uno
                          onChange={() => handleInviteUser(name)} // Utiliza un identificador único en lugar de "name" si tienes uno
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )} */}
    </div>
  );
}

export default Home;

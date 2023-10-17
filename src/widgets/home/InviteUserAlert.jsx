import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/configs/firebase/credential";
import { Input, Button, Alert } from "@material-tailwind/react";
import { nameDoc } from "@/configs/firebase/nameDoc";
import { userKey } from "@/hooks/auth";

export function InviteUserAlert({ data }) {
  const { diagramId, userRef } = data;
  console.log("userRef ", userRef);
  console.log("Diagrama ID ", diagramId);
  const [isInviteAlertOpen, setIsInviteAlertOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [invitedUser, setInvitedUser] = useState(null);

  useEffect(() => {
    // Cargar la lista de usuarios desde Firebase
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, nameDoc.USERS));
      const usersData = [];
      querySnapshot.forEach((doc) => {
        // Obtener el ID de cada documento
        const userData = doc.data();
        const userId = doc.id;
        // Almacenar el ID junto con los datos del usuario
        usersData.push({ ...userData, id: userId });
      });
      setUserList(usersData);
    };

    fetchData();
  }, []);

  const handleInviteUser = async () => {
    try {
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const id = userRef.id;

      const selectedDiagram = userData.diagrams[diagramId];

      if (!selectedDiagram) {
        throw new Error("El diagrama seleccionado no existe.");
      }

      const userToInvite = userList.find(
        (user) => user.email === selectedUserEmail
      );

      console.log("Lista de users ", userList);
      console.log(userToInvite);

      if (!userToInvite) {
        throw new Error("El usuario a invitar no se encontró en la lista.");
      }

      // Verificar si el usuario ya existe en la lista de invitados
      const isAlreadyInvited = selectedDiagram.guests.some(
        (guest) => guest.email === userToInvite.email
      );

      console.log("Esta invitado? ", isAlreadyInvited);

      if (!isAlreadyInvited) {
        // Actualizar los datos del usuario
        userData.diagrams[diagramId].guests.push({
          name: userToInvite.name,
          email: userToInvite.email,
          id: userToInvite.id,
        });

        // Actualizar el documento de usuario en Firestore
        await setDoc(userRef, userData);

        // Actualizar el estado local de los diagramas
        // setDiag(userData.diagrams);

        // Actualizar el localStorage
        localStorage.setItem(userKey, JSON.stringify({ ...userData, id }));

        // Actualizar la colección de "diagrams"
        const diagramRef = doc(db, nameDoc.DIAGRAMS, diagramId);
        const diagramDoc = await getDoc(diagramRef);
        if (diagramDoc.exists()) {
          const diagramData = diagramDoc.data();
          if (diagramData) {
            diagramData.guests.push({
              name: userToInvite.name,
              email: userToInvite.email,
              id: userToInvite.id,
            });
            await setDoc(diagramRef, diagramData);
          }
        }

        // Cerrar el Alert de invitación
        setIsInviteAlertOpen(false);
      } else {
        throw new Error("El usuario ya ha sido invitado a este diagrama.");
      }
    } catch (error) {
      // Manejar el error, mostrar un mensaje de error, etc.
      console.error("Error al invitar al usuario:", error);
    }
  };

  //   const handleInviteUser = () => {
  //     console.log(userList);
  //     // Buscar al usuario por su correo electrónico
  //     const userToInvite = userList.find(
  //       (user) => user.email === selectedUserEmail
  //     );

  //     if (userToInvite) {
  //       // Invitar al usuario y realizar las acciones necesarias
  //       setInvitedUser(userToInvite);
  //       // Agregar aquí la lógica para enviar la invitación
  //     } else {
  //       // Mostrar un mensaje de error si el usuario no se encontró
  //       setInvitedUser(null);
  //     }

  //     // Abre o cierra el Alert
  //     setIsInviteAlertOpen(!isInviteAlertOpen);
  //   };

  return (
    <div>
      <Button
        onClick={() => setIsInviteAlertOpen(!isInviteAlertOpen)}
        className="rounded-full"
      >
        Invitar Usuario
      </Button>

      <Alert
        open={isInviteAlertOpen}
        className="m-auto my-2 max-w-screen-md"
        color="gray"
        onClose={() => setIsInviteAlertOpen(false)}
      >
        <h2>Invitar Usuario</h2>
        <Input
          type="text"
          placeholder="Correo Electrónico del Usuario"
          value={selectedUserEmail}
          onChange={(e) => setSelectedUserEmail(e.target.value)}
        />
        <Button
          onClick={handleInviteUser}
          className="rounded bg-blue-500 px-3 py-1 text-white"
        >
          Invitar
        </Button>
        {invitedUser ? (
          <p>
            Usuario invitado: {invitedUser.name} ({invitedUser.email})
          </p>
        ) : (
          <p>Usuario no encontrado o error en la invitación.</p>
        )}
      </Alert>
    </div>
  );
}

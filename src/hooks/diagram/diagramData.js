import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { nameDoc } from "@/configs/firebase/nameDoc";
import { userKey } from "../auth";
import { initialData } from "@/pages/diagram";

export function useDiagramData(db, userRef, userDiagrms) {
  const [showForm, setShowForm] = useState(false);
  const [diagramName, setDiagramName] = useState("");
  const [diagrams, setDiagrams] = useState(userDiagrms);
  const [editingDiagramIndex, setEditingDiagramIndex] = useState(null);
  const [selectDiagram, setSelectDiagram] = useState(null);

  const editedDiagramNameRef = useRef(null);

  const changedDiagramName = (value) => {
    setDiagramName(value);
  };

  const handleSelectDiagram = (index) => {
    setSelectDiagram(index);
  };

  const handleEditDiagram = (index) => {
    setEditingDiagramIndex(index);
    editedDiagramNameRef.current.value = diagrams[index].name;
  };

  const handleDiagramNameChange = (index, newName) => {
    const updatedDiagrams = [...diagrams];
    updatedDiagrams[index].name = newName;
    setDiagrams(updatedDiagrams);
  };

  const handleCancel = () => {
    setEditingDiagramIndex(null);
    setShowForm(false);
  };

  const handleDeleteDiagram = async (index) => {
    const updatedDiagrams = [...diagrams];
    updatedDiagrams.splice(index, 1);

    const updatedUserDoc = await getDoc(userRef);
    const userData = updatedUserDoc.data();
    userData.diagrams = updatedDiagrams;
    await setDoc(userRef, userData);
    setDiagrams(userData.diagrams);
  };

  const handleAddDiagram = () => {
    setShowForm(true);
  };

  const handleSaveDiagramEdit = (index) => {
    if (editedDiagramNameRef.current.value.trim() !== "") {
      const updatedDiagrams = [...diagrams];
      updatedDiagrams[index].name = editedDiagramNameRef.current.value;
      setDiagrams(updatedDiagrams);
      setEditingDiagramIndex(null);
    }
  };

  const handleSaveDiagram = async () => {
    try {
      if (diagramName) {
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const id = userRef.id;

        console.log(userData);

        const newDiagram = {
          name: diagramName,
          data: initialData,
          owner: id, // Agrega el ID del usuario propietario
          guests: [], // Inicialmente, la lista de invitados está vacía
        };

        // Genera el id
        const diagramRef = await addDoc(
          collection(db, nameDoc.DIAGRAMS),
          newDiagram
        );

        const diagramId = diagramRef.id;

        // Agragar al map con key el id del diagrama
        userData.diagrams[diagramId] = {
          name: diagramName,
          guests: [],
        };

        // Actualizar el documento de usuario en Firestore
        await setDoc(userRef, userData);

        // Actualizar diagram
        setDiagrams(userData.diagrams);
        localStorage.setItem(userKey, JSON.stringify({ ...userData, id }));

        setDiagramName("");
        setShowForm(false);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // useEffect(() => {
  //   const getData = async () => {
  //     const userDoc = await getDoc(userRef);
  //     return userDoc.data();
  //   };

  //   getData()
  //     .then((data) => {
  //       const diagramData = data.diagrams;
  //       setDiagrams(diagramData);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  return {
    showForm,
    diagramName,
    diagrams,
    selectDiagram,
    editingDiagramIndex,
    editedDiagramNameRef,
    changedDiagramName,
    handleEditDiagram,
    handleDiagramNameChange,
    handleCancel,
    handleDeleteDiagram,
    handleAddDiagram,
    handleSaveDiagramEdit,
    handleSaveDiagram,
    handleSelectDiagram,
  };
}

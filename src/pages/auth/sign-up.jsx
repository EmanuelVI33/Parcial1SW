import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useRef } from "react";
import { userContext } from "@/context/userContext";

export function SignUp() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef(null);

  const { register } = userContext();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const name = nameRef.current.value;

      await register(name, email, password);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <img
        src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Crear Cuenta
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input label="Nombre" size="lg" inputRef={nameRef} />
            <Input type="Correo" label="Email" size="lg" inputRef={emailRef} />
            <Input
              type="Password"
              label="Contrasaña"
              size="lg"
              inputRef={passwordRef}
            />
            <div className="-ml-2.5">
              <Checkbox label="Aceptar terminos y condiciones" />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" fullWidth onClick={handleSignUp}>
              Crear
            </Button>
            <Typography variant="small" className="mt-6 flex justify-center">
              Ya tienes una cuenta?
              <Link to="/auth/sign-in">
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 font-bold"
                >
                  Iniciar sesión
                </Typography>
              </Link>
            </Typography>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignUp;

// createUserWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Crear user en firestore
//     // return db.collection("users").doc(userCredential.user.uid).set({
//     //   name: name,
//     // });
//     console.log(`Credenciales ${userCredential}`);
//     const userRef = doc(db, `users/${userCredential.user.uid}`);
//     setDoc(userRef, { name });
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     console.log(errorCode, errorMessage);
//   });

// try {
//   await createUserWithEmailAndPassword(auth, email, password);
//   // Si el registro es exitoso, puedes actualizar el nombre del usuario en Firebase.
//   // const user = auth.currentUser;
//   // if (user) {
//   //   await user.updateProfile({
//   //     displayName: name,
//   //   });
//   // }
//   // Luego, puedes redirigir al usuario a la página de inicio, por ejemplo.
// } catch (error) {
//   console.error("Error al registrar usuario:", error);
// }

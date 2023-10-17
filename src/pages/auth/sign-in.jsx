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

export function SignIn() {
  const emailRef = useRef();
  const passwordRef = useRef();

  const { login } = userContext();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      await login(email, password);
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
              Iniciar Sesión
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input type="email" label="Correo" size="lg" inputRef={emailRef} />
            <Input
              type="password"
              label="Contraseña"
              size="lg"
              inputRef={passwordRef}
            />
            <div className="-ml-2.5">
              <Checkbox label="Recuerdame" />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" fullWidth onClick={handleSignIn}>
              Ingresar
            </Button>
            <Typography variant="small" className="mt-6 flex justify-center">
              No tienes una cuenta?
              <Link to="/auth/sign-up">
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 font-bold"
                >
                  Registrate
                </Typography>
              </Link>
            </Typography>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignIn;

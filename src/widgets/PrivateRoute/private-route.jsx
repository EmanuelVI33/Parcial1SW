import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useUserContext } from "./userContext"; // Asegúrate de importar el contexto de usuario

function PrivateRoute({ component: Component, ...rest }) {
  const { user } = useUserContext(); // Obtén el usuario del contexto de usuario

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/sign-in" /> // Redirige a la página de inicio de sesión si el usuario no está autenticado
        )
      }
    />
  );
}

export default PrivateRoute;

// components/Alert.example.js
// Ejemplos de uso del componente Alert

import Alert from './Alert';

// Ejemplo 1: Alerta de éxito simple
<Alert type="success">
  La tarea se ha creado exitosamente.
</Alert>

// Ejemplo 2: Alerta de error con título
<Alert type="error" title="Error de autenticación">
  Las credenciales proporcionadas son incorrectas. Por favor, verifica tu correo y contraseña.
</Alert>

// Ejemplo 3: Alerta de advertencia cerrable
<Alert 
  type="warning" 
  title="Atención" 
  dismissible 
  onDismiss={() => console.log('Alerta cerrada')}
>
  Esta acción no se puede deshacer. ¿Estás seguro de continuar?
</Alert>

// Ejemplo 4: Alerta informativa con contenido personalizado
<Alert type="info" title="Información importante">
  <p>El sistema se actualizará el próximo viernes a las 2:00 AM.</p>
  <p className="mt-2 text-xs opacity-75">Por favor, guarda tu trabajo antes de esa hora.</p>
</Alert>

// Ejemplo 5: Alerta con icono personalizado
import { CheckCircle } from 'lucide-react';

<Alert 
  type="success" 
  icon={CheckCircle}
  title="Proceso completado"
>
  Todos los cambios han sido guardados correctamente.
</Alert>

// Ejemplo 6: Alerta responsive en un contenedor
<div className="max-w-2xl mx-auto p-4">
  <Alert type="info" dismissible>
    Este es un ejemplo de alerta responsive que se adapta al ancho del contenedor.
  </Alert>
</div>


# Security Shift Manager - Mobile

App mobile (Expo + React Native) para gestionar los horarios de los guardias de seguridad y los servicios donde trabajan.

Usa la API de [security-shift-manager-backend](https://github.com/HerreroT/security-shift-manager-backend).

## Funcionalidades

- **¿Quién estuvo?**: elegís un servicio, un día y una hora, y la app muestra qué guardia estaba de turno, con su DNI y teléfono.
- **Inicio**: guardias en servicio en este momento y turnos del día.
- **Turnos**: turnos por día, con filtros por servicio y guardia. Desde ahí se pueden crear, editar y eliminar turnos y registrar la entrada y la salida reales. Los turnos nocturnos (por ejemplo, de 20:00 a 08:00) terminan al día siguiente automáticamente.
- **Guardias**: listado con búsqueda por nombre o DNI, alta y edición. El detalle muestra las **horas trabajadas en el mes** (del 1 al 31) con el detalle de cada turno.
- **Servicios**: listado con búsqueda por nombre o ubicación, alta, edición y turnos de cada día.
- **Reporte mensual**: horas de todos los guardias en un mes.

## Cómo correrla

1. Levantá el backend (ver su README). Queda escuchando en el puerto `8090`.
2. Instalá las dependencias y arrancá Expo:

   ```bash
   npm install
   npx expo start
   ```

3. Abrí la app:
   - **Celular con Expo Go**: escaneá el código QR. El celular tiene que estar en la misma red WiFi que la PC.
   - **Emulador Android**: tocá `a` en la terminal de Expo.

4. Ingresá con el usuario de prueba `admin@shiftmanager.com` / `admin123`.

### ¿Cómo encuentra la app al backend?

No hace falta configurar nada. La app usa la misma IP con la que Expo Go se conecta a la PC y apunta al puerto 8090, por ejemplo `http://192.168.0.10:8090/api`. En la pantalla de login, en modo desarrollo, se muestra la URL que está usando.

Si necesitás otra URL, por ejemplo con `npx expo start --tunnel` o con el backend en otra máquina:

```bash
cp .env.example .env
# editá EXPO_PUBLIC_API_URL y reiniciá Expo
```

| Dónde corre la app | URL |
|---|---|
| Celular con Expo Go | `http://<IP-de-la-PC>:8090/api` |
| Emulador Android | `http://10.0.2.2:8090/api` |
| Navegador / simulador iOS | `http://localhost:8090/api` |

Si el celular dice "No se pudo conectar con el servidor":

- Revisá que el backend esté corriendo.
- Revisá que el celular y la PC estén en la misma red WiFi.
- Revisá que el Firewall de Windows permita conexiones entrantes al puerto 8090 en redes privadas.

## Estructura

```
app/                  Pantallas (expo-router)
  (auth)/login.tsx    Login
  (tabs)/             Inicio, ¿Quién estuvo?, Turnos, Guardias, Servicios
  guards/             Detalle y formulario de guardia
  services/           Detalle y formulario de servicio
  shifts/form.tsx     Alta / edición de turnos
  reports/monthly.tsx Reporte mensual de horas
components/           Componentes reutilizables (botones, campos, selectores, estados)
hooks/                useFetch (carga de datos), useDebouncedValue
lib/                  Cliente HTTP, sesión (expo-secure-store), fechas, configuración
types/                Tipos de la API
```

## Scripts

```bash
npx expo start      # servidor de desarrollo
npm run lint        # ESLint
npx tsc --noEmit    # chequeo de tipos
```

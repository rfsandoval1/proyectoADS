# Frontend simple para Sistema Roles

Pequeña interfaz estática que consume la API en `http://127.0.0.1:3000`.

Cómo ejecutar:

- Usando `npx http-server` o `npx serve` (recomendado):

```powershell
cd frontend
npx http-server -p 8080
# o: npx serve -p 8080
```

Abre en el navegador: `http://127.0.0.1:8080`

- También puedes abrir `frontend/index.html` directamente, pero algunos navegadores bloquean peticiones desde `file://`.

Credenciales de ejemplo (definidas en la API):
- `cliente@test.com` / `Cliente123!`
- `asistente@test.com` / `Asistente123!`
- `gerente@test.com` / `Gerente123!`

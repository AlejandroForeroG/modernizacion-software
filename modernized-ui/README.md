# PetClinic modernized UI

React client used by the pre-experiment for RQ-01 (search owners) and RQ-06
(register visits). It coexists with the Thymeleaf application and consumes the new
REST boundary through the Vite development proxy.

## Run locally

1. Start the Spring Boot backend on port 8080.
2. Install dependencies with `npm install`.
3. Start the client with `npm run dev`.
4. Open `http://localhost:5174`.

The "Vista legada" link opens the original Thymeleaf flow for side-by-side demo.

## Presentation

Open `/slides` or `/slides/semana-7` for the 14-slide Week 7 advance video deck.
The previous comprehensive deck is preserved at `/slides/semana-8` as working
material for the final delivery. Arrow keys change slides, `N` toggles speaker
notes and `O` opens the overview.

## Verification

With Spring Boot and Vite running on ports 8080 and 5174:

```powershell
pnpm build
pnpm test:e2e
```

The browser test verifies RQ-01, RQ-06, desktop/mobile layouts and all slide
viewports. Evidence screenshots are written to `../docs/evidence/preexperiment`.

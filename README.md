# Takenos Innovahack 2025

Aplicación web construida con Next.js, TypeScript, Tailwind CSS y shadcn/ui.

## Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   └── dashboard/            # Páginas del dashboard
├── components/               # Componentes reutilizables
│   ├── layout/              # Componentes de layout
│   └── ui/                  # Componentes de shadcn/ui
├── contexts/                # Contextos de React
├── features/                # Features organizadas por dominio
│   ├── auth/
│   ├── dashboard/
│   ├── inspectors/
│   ├── plots/
│   └── producers/
├── hooks/                   # Custom hooks
├── infrastructure/          # Configuración de infraestructura
│   └── api/
├── lib/                     # Utilidades y helpers
│   ├── api/                # Cliente API
│   └── firebase/
└── shared/                  # Código compartido
    ├── constants/          # Constantes
    ├── types/              # Tipos TypeScript
    ├── utils/              # Utilidades
    └── validators/         # Validadores
```

## Características

- ✅ Next.js 16 con App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui components
- ✅ Arquitectura basada en features
- ✅ API Routes configuradas
- ✅ Sistema de autenticación (mock)
- ✅ Layout responsivo con sidebar

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Componentes shadcn/ui Instalados

- button
- card
- input
- label
- select
- table
- dialog
- dropdown-menu
- badge
- avatar
- separator
- breadcrumb
- checkbox
- alert-dialog
- sonner (toast)
- skeleton

## Próximos Pasos

1. Instalar componentes adicionales de shadcn/ui según necesidad
2. Implementar las features completas
3. Conectar con backend real
4. Implementar autenticación real

import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
      usuario: null,
      rol: null,
      isAuthenticated: false,
      permisos: [],
      
      login: (userData) => {
        const { usuario, password, rol } = userData
        
        const usuarios = {
          'padre1@email.com': { nombre: 'Carlos Rodríguez', rol: 'padre', hijos: [1, 2] },
          'tutor1@email.com': { nombre: 'María García', rol: 'tutor', alumnos: [1, 2, 3, 4, 5] },
          'admin@talentos.edu': { nombre: 'Dr. Juan Pérez', rol: 'admin' },
          'entrada@talentos.edu': { nombre: 'Pedro Sánchez', rol: 'entrada' }
        }
        
        const usuarioEncontrado = usuarios[usuario]
        
        if (usuarioEncontrado && password === '123456') {
          const permisos = get().getPermisosPorRol(usuarioEncontrado.rol)
          
          set({
            usuario: usuarioEncontrado,
            rol: usuarioEncontrado.rol,
            isAuthenticated: true,
            permisos
          })
          
          return { success: true, usuario: usuarioEncontrado }
        }
        
        return { success: false, error: 'Credenciales incorrectas' }
      },
      
      logout: () => {
        set({
          usuario: null,
          rol: null,
          isAuthenticated: false,
          permisos: []
        })
      },
      
      getPermisosPorRol: (rol) => {
        const permisos = {
          padre: ['ver_asistencia', 'ver_mensajes', 'enviar_mensajes', 'ver_notas', 'ver_comunicados', 'subir_vouchers', 'ver_pagos'],
          tutor: ['ver_alumnos', 'enviar_mensajes', 'crear_comunicados', 'ver_asistencia_grupo'],
          admin: ['gestionar_usuarios', 'ver_reportes', 'enviar_comunicados_masivos', 'gestionar_sistema', 'gestionar_pagos', 'aprobar_pagos', 'ver_reportes_pagos', 'gestionar_conceptos_pago'],
          entrada: ['registrar_asistencia', 'escanear_qr']
        }
        
        return permisos[rol] || []
      },
      
      tienePermiso: (permiso) => {
        const { permisos } = get()
        return permisos.includes(permiso)
      }
    }))

export default useAuthStore
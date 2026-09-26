describe('FinanPOS - Flujo Crítico End-to-End', () => {
  beforeEach(() => {
    // Apuntar a la URL en producción / staging en Vercel
    cy.visit('https://app-finanzasycobros-rust.vercel.app');
  });

  it('Debe rechazar login inválido y aceptar login válido', () => {
    cy.url().should('include', '/login');
    
    // Login inválido
    cy.get('input[type="email"]').clear().type('falso@finanzas.com');
    cy.get('input[type="password"]').clear().type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Usuario no encontrado').should('be.visible');

    // Login válido
    cy.get('input[type="email"]').clear().type('admin@finanzas.com');
    cy.get('input[type="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    // Debe redirigir al dashboard
    cy.url().should('not.include', '/login');
    cy.contains('Dashboard').should('be.visible');
  });

  it('Debe crear un nuevo cliente', () => {
    // Login rápido
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'dummy_token'); // Cypress interceptará esto en un escenario real, o lo hacemos normal
    });
    cy.visit('https://app-finanzasycobros-rust.vercel.app/login');
    cy.get('input[type="email"]').clear().type('admin@finanzas.com');
    cy.get('input[type="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    // Navegar a clientes
    cy.get('nav').contains('Clientes').click();
    cy.contains('Gestión de Clientes').should('be.visible');

    // Clic en Nuevo Cliente
    cy.contains('Nuevo Cliente').click();
    
    // Llenar formulario
    const randomDoc = `DOC-${Math.floor(Math.random() * 10000)}`;
    cy.get('input[required]').eq(0).type('Cliente Cypress E2E'); // Nombre
    cy.get('input[required]').eq(1).type(randomDoc); // Documento
    cy.get('input[required]').eq(2).type('555-0000'); // Teléfono
    cy.get('input').eq(3).type('Calle Falsa 123'); // Dirección
    
    cy.get('button').contains('Guardar Cliente').click();

    // Validar que aparezca en la tabla/cards
    cy.contains('Cliente Cypress E2E').should('be.visible');
  });

  it('Debe ser responsive y usar menú hamburguesa en móvil', () => {
    cy.viewport('iphone-xr'); // 414x896
    cy.visit('https://app-finanzasycobros-rust.vercel.app/login');
    cy.get('input[type="email"]').clear().type('admin@finanzas.com');
    cy.get('input[type="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    // Validar sidebar oculto
    cy.get('.sidebar').should('have.css', 'transform').and('not.match', /matrix\(1, 0, 0, 1, 0, 0\)/); // No está en X=0
    
    // Abrir menú hamburguesa
    cy.get('.mobile-menu-btn').should('be.visible').click();
    
    // Validar sidebar abierto
    cy.get('.sidebar').should('have.class', 'open');
    
    // Navegar a préstamos
    cy.get('nav').contains('Préstamos').click();
    
    // Validar que el menú se cierra automáticamente (y cambia de ruta)
    cy.url().should('include', '/prestamos');
    cy.get('.sidebar').should('not.have.class', 'open');
  });
});

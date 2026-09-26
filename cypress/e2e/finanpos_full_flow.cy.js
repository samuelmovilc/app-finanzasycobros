describe('FinanPOS - Flujo Crítico End-to-End', () => {
  beforeEach(() => {
    cy.visit('https://app-finanzasycobros-rust.vercel.app');
  });

  const testLoginAndNavigation = (viewportName, width, height) => {
    it(`Debe fluir correctamente en ${viewportName} (${width}x${height})`, () => {
      cy.viewport(width, height);
      
      // Login
      cy.get('input[type="email"]').clear().type('admin@finanzas.com');
      cy.get('input[type="password"]').clear().type('admin123');
      cy.get('button[type="submit"]').click();
      cy.contains('Dashboard').should('be.visible');

      // Si es móvil, verificar el sidebar oculto y el menú hamburguesa
      if (width < 768) {
        cy.get('.sidebar').should('have.css', 'transform').and('not.match', /matrix\(1, 0, 0, 1, 0, 0\)/);
        cy.get('.mobile-menu-btn').should('be.visible').click();
        cy.get('.sidebar').should('have.class', 'open');
        cy.get('nav').contains('Clientes').click();
        cy.contains('Gestión de Clientes').should('be.visible');
        cy.get('.sidebar').should('not.have.class', 'open');
        
        // Verificar que las tablas se convirtieron en tarjetas (tienen flex/block en vez de table-row)
        cy.get('.data-table tr').first().should('have.css', 'display', 'flex');
      } else {
        // Desktop
        cy.get('nav').contains('Clientes').click();
        cy.contains('Gestión de Clientes').should('be.visible');
        // Verificar que el contenedor principal ocupe espacio completo y no haya márgenes muertos masivos
        cy.get('.main-content').invoke('width').should('be.gt', width - 300); // Casi todo el ancho menos el sidebar
      }
    });
  };

  testLoginAndNavigation('Ultrawide Desktop', 1920, 1080);
  testLoginAndNavigation('Standard Desktop', 1366, 768);
  testLoginAndNavigation('iPhone Pro Max', 428, 926);
  testLoginAndNavigation('iPhone SE', 375, 667);
});

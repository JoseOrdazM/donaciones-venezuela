window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';
  const U = App.Utils;
  App.Refugios = {
    filtrar: function (centros) {
      return (centros || []).filter(function (c) {
        const tipo = U.normalizar(c.tipo + ' ' + c.nombre);
        return tipo.indexOf('refugio') !== -1;
      });
    },
    capacidadDisponible: function (refugio) {
      return refugio.capacidadDisponible || refugio.capacidad || 'por confirmar';
    }
  };
})(window.Humanitaria);

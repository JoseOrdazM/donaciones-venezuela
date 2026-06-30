window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';
  const U = App.Utils;
  App.Hospitales = {
    filtrar: function (centros) {
      return (centros || []).filter(function (c) { return U.normalizar(c.tipo).indexOf('hospital') === 0; });
    },
    estadoOperativo: function (hospital) {
      const pendientes = (hospital.necesita || []).length;
      if (pendientes >= 2) return 'Necesita apoyo';
      if (pendientes === 1) return 'Operativo parcial';
      return 'Operativo';
    }
  };
})(window.Humanitaria);

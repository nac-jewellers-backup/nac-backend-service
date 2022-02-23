'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('trans_sku_descriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      sku_id: {
        type: Sequelize.STRING,
        references: {
          model: 'trans_sku_lists', // name of Source model
          key: 'generated_sku',
        }
      },
      vendor_code: {
        type: Sequelize.STRING
      },
      sku_description: {
        type: Sequelize.STRING
      },
      vendor_lead_time: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('trans_sku_descriptions');
  }
};
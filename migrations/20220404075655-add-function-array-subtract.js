"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {    
    return queryInterface.sequelize.query(`create or replace function 
      array_subtract(minuend anyarray, subtrahend anyarray, out difference anyarray)
      returns anyarray as
      $$
      begin
        execute 'select array(select unnest($1) except select unnest($2))'
        using minuend, subtrahend
        into difference;
      end;
      $$ language plpgsql returns null on null input;`);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS array_subtract`
    );
  },
};

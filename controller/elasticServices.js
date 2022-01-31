const es = require("elasticsearch");
const esClient = new es.Client({
  host: "https://search-nac-website-pzyrwbnys2czgsok6c37kqhrwq.ap-south-1.es.amazonaws.com/",
  httpAuth: "root:MyvCAnI&8ngo",
  requestTimeout: Infinity,
  keepAlive: false,
  // log: "trace"
});

module.exports = {
  /* function : Ping esServer */
  esPing: function () {
    return new Promise((resolve, reject) => {
      esClient.ping({ requestTimeout: 30000 }, function (_err) {
        if (_err) {
          return reject({ status: false, message: "elasticServer:Error" });
        } else {
          return resolve({ status: true, message: "elasticServer: Running " });
        }
      });
    });
  },
  /* delete a _index from cluster  */
  initIndex: function (indexName, _settings) {
    return new Promise(async (resolve, reject) => {
      await esClient.indices
        .create({ index: indexName, body: _settings ? _settings : {} })
        .then(
          async function (_result) {
            return resolve({ data: true, status: 200, message: _result });
          },
          function (_err) {
            return reject({ data: false, status: 500, message: _err.message });
          }
        );
    });
  },
  deleteIndex: async function (indexArray) {
    return new Promise((resolve, reject) => {
      esClient.indices.delete({ index: indexArray }, function (_err) {
        if (_err) {
          return reject({ data: false, status: 500, message: _err.message });
        } else {
          return resolve({ data: true, status: 200, message: "deleted" });
        }
      });
    });
  },

  /*check for Index in cluster  */
  indexExists: function (indexName) {
    return new Promise((resolve, reject) => {
      esClient.indices.exists({ index: [indexName] }).then(
        function (resp) {
          return resolve({ data: true, status: 200, message: resp });
        },
        function (_err) {
          return reject({ data: false, status: 500, message: _err.message });
        }
      );
    });
  },
  initMapping: function (indexName, docType, payload) {
    return new Promise((resolve, reject) => {
      esClient.indices
        .putMapping({
          include_type_name: true,
          index: indexName,
          type: docType,
          body: payload,
        })
        .then(
          function (resp) {
            return resolve({ data: true, status: 200, message: resp });
          },
          function (_err) {
            return reject({ data: false, status: 500, message: _err.message });
          }
        );
    });
  },

  addDocument: (indexName, docType, _id, payload) => {
    return new Promise((resolve, reject) => {
      esClient
        .index({
          index: indexName,
          type: docType,
          id: _id,
          body: payload,
        })
        .then(
          function (_res) {
            return resolve({ data: true, status: 200, message: _res });
          },
          function (_err) {
            return reject({ data: false, status: 500, message: _err.message });
          }
        );
    });
  },
  esSearch: async function (indexName, docType, payload) {
    return new Promise(async (resolve, reject) => {
      await esClient
        .search({
          index: indexName,
          type: docType,
          body: payload,
        })
        .then(
          function (resp) {
            return resolve({ data: true, status: 200, message: resp });
          },
          function (_err) {
            return reject({ data: false, status: 500, message: _err.message });
          }
        );
    });
  },
  docBulk: function (payload) {
    return new Promise((resolve, reject) => {
      esClient
        .bulk({
          body: payload,
        })
        .then(
          function (_res) {
            return resolve({
              data: true,
              status: 200,
              message: _res,
              extra: "Bulk Insert Done",
            });
          },
          function (_err) {
            return reject({ data: false, status: 500, message: _err.message });
          }
        );
    });
  },

  putSettings: async (indexName, settings) => {
    return new Promise(async (resolve, reject) => {
      await esClient.indices
        .putSettings({
          index: indexName,
          type: "_doc",
          body: settings,
        })
        .then((_res) => {
          resolve({ status: "true", response: _res });
        });
    });
  },

  parseSEO: async function (seoArray) {
    let _results = [];
    seoArray.map((first) => {
      console.log(first["message"]["suggest"]["seo_search"]["options"]);
      first["message"]["suggest"]["seo_search"][0]["options"].map((second) => {
        second["_source"];
      });
    });

    _results.sort((a, b) => a.priority - b.priority);

    console.log(_results);
  },
};

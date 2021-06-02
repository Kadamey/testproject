sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    assignObjectModel: function (object, data, modelName) {
      var myModel = new JSONModel();

      if (Array.isArray(data[0].Rowsets.Rowset.Row)) {
        myModel.setData(data[0]);
      } else if (!data[0].Rowsets.Rowset.Row) {
        object.setModel(null);
      } else {
        var obj_iv_data = data[0];
        var dummyData = [];
        dummyData.push(data[0].Rowsets.Rowset.Row);
        data[0].Rowsets.Rowset.Row = dummyData;
        myModel.setData(data[0]);
      }
      object.setModel(myModel);
    },
  };
});

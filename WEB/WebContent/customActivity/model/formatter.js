sap.ui.define([], function () {
    "use strict";

    return {

        result: function (VALUE, WEIGHT) {
            // var value= this.getView().byId("idSclrInput").getValue();
            if (!!VALUE) {
                if(!(!!WEIGHT)){
                    WEIGHT=1;
                }
                VALUE = parseFloat(VALUE.toString().replaceAll(',', '.')).toFixed(2);
                return Math.round((WEIGHT * VALUE) / 100);
            }
            return 0;
        }

    };

});

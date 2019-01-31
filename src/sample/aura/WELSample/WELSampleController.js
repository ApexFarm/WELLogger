({
  doInit : function(component, event, helper) {
    var action = component.get("c.doSomeWork");
    action.setParams({
      param1 : component.get("v.param1"),
      param2 : component.get("v.param2")
    });

    action.setCallback(this, function(response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        wellogger(response.getReturnValue().logs);
      }
      else if (state === "INCOMPLETE") {
        // do something
      }
      else if (state === "ERROR") {
        var errors = response.getError();
        if (errors) {
          if (errors[0] && errors[0].message) {
            console.log("Error message: " + errors[0].message);
          }
        } else {
          console.log("Unknown error");
        }
      }
    });

    $A.enqueueAction(action);
  }
})

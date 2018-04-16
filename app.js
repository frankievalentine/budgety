// Budget Controller
var budgetController = (function() {

    // some code

})();

// UI Controller
var UIController = (function() {

    // Public function that iffy returns with object assigned to UIController
    return {
        getinput: function() {
            return {
                getInput: function() {
                    return {
                        type: document.querySelector('.add__type').value, // type inc or exp
                        description: document.querySelector('.add__description').value,
                        value: document.querySelector('.add__value').value
                    }
                }
            }
        }
    }
})();

// Global App Controller
// Central place what happens on each event and delegate to other controllers
var controller = (function(budgetCtrl, UICtrl) {

    // Used in both event listeners, requires seperate function
    var ctrlAddItem = function() {
        // Get field input data
        var input = UICtrl.getinput();
        console.log(input);

        // Add item to budget controller
        
        // Add new item to UI

        // Calculate the budget

        // Display budget to UI
    }

    document.querySelector(".add__btn").addEventListener('click', ctrlAddItem);

    // Global document event listener
    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });

})(budgetController, UIController);



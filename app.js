// Budget Controller
var budgetController = (function() {

    // some code

})();

// UI Controller
var UIController = (function() {

    // Central place for selector strings
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    }

    // Public function that iffy returns with object assigned to UIController
    return {
        getInput: function() {
                return {
                    type: document.querySelector(DOMstrings.inputType).value, // type inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: document.querySelector(DOMstrings.inputValue).value
                }
        },
        // Expose selector strings to global scope
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

// Global App Controller
// Central place what happens on each event and delegate to other controllers
var controller = (function(budgetCtrl, UICtrl) {

    // All event listeners placed here
    var setupEventListeners = function() {
        // getDOMstrings object is located in UI Controller
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Global document event listener
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    // Used in both event listeners, requires seperate function
    var ctrlAddItem = function() {
        // Get field input data
        var input = UICtrl.getInput();

        // Add item to budget controller
        
        // Add new item to UI

        // Calculate the budget

        // Display budget to UI
    };

    // Public initialization function
    return {
        init: function() {
            setupEventListeners();
        }
    }
})(budgetController, UIController);

// Call the setupEventListeners object
controller.init();

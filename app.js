// Budget Controller
var budgetController = (function() {

    // Private function constructors for data of Expense and Income
    // First letter capitalized
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Store both Expense and Income into one data structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    // Create public access to data methods
    return {
        // Income or Expense, description, value
        // type from getInput object
        addItem: function(type, des, val) {
            var newItem, ID;

            // new ID for newItem
            // ID = last ID + 1
            // type will be 'inc' or 'exp'
            // if allItems object is > 0 locate the last position of [type] array
            // otherwise the ID is 0
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push to data set allItems object
            data.allItems[type].push(newItem);
            // return new element so new data created has access publicly
            return newItem;
        },

        testing: function() {
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function() {

    // Central place for selector strings
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
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
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
            } else if (type == 'exp') {
                element = DOMstrings.expensesContainer;
                 html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
            }
            // Replace placeholder text with data
            // id property holds the id
            newHtml = html.replace('%id%', obj.id);
            // newHtml is now the id
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML into DOM (using incertAdjacent method)
            // Child's of income__list and expense__list
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
        var input, newItem;

        // Get field input data
        input = UICtrl.getInput();

        // Add item to budget controller (addItem accepts three parameters)
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // Add new item to UI
        UICtrl.addListItem(newItem, input.type);
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

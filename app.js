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

    calculateTotal = function(type) {
        // Get array, loop over it, and add values
        // Initial sum is 0 if values in array are [200, 300, 400] | its sum + 200, sum + 300, sum + 400
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });
        // Store new sums in data totals object
        data.totals[type] = sum;
    }

    // Store both Expense and Income into one data structure / global data model
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // non-existent value
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

        calculateBudget: function() {
            // Income plus expense total
            calculateTotal('exp');
            calculateTotal('inc');
            // Retrieve values from totals object and subtract
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate % of income spent = exp / inc (100/200 = 0.5) so multiply 100 to get percentage
            // Round to fix fractional integers and if statement to fix "Infinity" value
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        // testing method useful for development not in production
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    // Public function that iffy returns with object assigned to UIController
    return {
        getInput: function() {
                return {
                    type: document.querySelector(DOMstrings.inputType).value, // type inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat convert #
                }
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
            } else if (type == 'exp') {
                element = DOMstrings.expensesContainer;
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
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
        },
        clearFields: function() {
            var fields, fieldsArr;
            // querySelectorAll method returns a list, not an array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // tricks slice method into returning an array, from something that isn't an array
            fieldsArr = Array.prototype.slice.call(fields);
            // current element, current index, current array (fieldsArr)
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            // set focus to first element after input
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            // print 4 peices of data DOM manipulation
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            // Show the user the percentage if greater than 0 or dashes when not
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
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
        // DOM was reset in setupEventListeners function
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    // Called each time newItem is entered in UI
    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();
        // Return the budget stored in a variable
        var budget = budgetCtrl.getBudget();
        // Display returned budget object (above) to UI
        UICtrl.displayBudget(budget);
    }

    // Used in both event listeners, requires seperate function
    var ctrlAddItem = function() {
        var input, newItem;

        // Get field input data
        input = UICtrl.getInput();

        // Description different from empty string, value is not a number, and value is greater than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add item to budget controller (addItem accepts three parameters)
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add new item to UI
            UICtrl.addListItem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();
        }
    };

    // Still have access to the event object to locate the fired target element
    // Original fired target for the delete button is the icon, we want the whole parent element
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // Split the target HTML "id='inc-0'" into an array ['inc', '0']
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            // Delete item from global data model

            // Delete item from UI

            // Update and show new budget

        }

    };

    // Page load initialization function
    return {
        init: function() {
            // Set budget to 0
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            // Start event listeners
            setupEventListeners();
        }
    }
})(budgetController, UIController);

// Call the setupEventListeners object
controller.init();

// Budget Controller
var budgetController = (function() {
  // Private function constructors for data of Expense and Income
  // First letter capitalized
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Adding calcPercentage object to the Expense prototype
  // Specific function to calculate totalIncome parameter > 0
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Return the percentage calculated
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

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
  };

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
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // push to data set allItems object
      data.allItems[type].push(newItem);
      // return new element so new data created has access publicly
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // since id's can be deleted we need to locate the index of the id not the id itself
      // map returns a brand new array with the current id's in the data set
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      // returns index of the element with the id we included in the parameter
      index = ids.indexOf(id);

      // splice removes elements from the array, while slice is used to create a copy
      // starts removing at number index, and removes just one
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Income plus expense total
      calculateTotal("exp");
      calculateTotal("inc");
      // Retrieve values from totals object and subtract
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate % of income spent = exp / inc (100/200 = 0.5) so multiply 100 to get percentage
      // Round to fix fractional integers and if statement to fix "Infinity" value
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      // Loop over expenses and use current calculated percentage
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    // Return calc percentages and store
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
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
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  // Private function to format number
  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    // + or - before num exactly 2 decimal points comma seperating thousands
    // 2310.4567 -> + 2,310.46
    // Overrides num argument to Math.abs | removes sign of number
    num = Math.abs(num);

    // num.toFixed is a method of the number prototype always puts 2 decimals on the num
    // (2.4567).toFixed(2) -> "2.46"
    num = num.toFixed(2);

    // Divide num into integer part and decimal part stored in an array
    // int.length is how many numbers we have in the string containing num
    // 2000 = 4 length
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      // Substring returns part of string we want (pos, read)
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // 2310 = 2,310
    }

    dec = numSplit[1];

    // Returned first, since parentheses, if type is 'exp' then sign is - if not sign is +
    // Returned second int formatted with comma and finally decimal
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  // Private function for loop in each iteration calls the callback function
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  // Public function that iffy returns with object assigned to UIController
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // type inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat convert #
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
      } else if (type == "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" /></button></div></div></div>';
      }
      // Replace placeholder text with data
      // id property holds the id
      newHtml = html.replace("%id%", obj.id);
      // newHtml is now the id
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert HTML into DOM (using incertAdjacent method)
      // Child's of income__list and expense__list
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      // selectorID we pass in located by going up parentNode, then removing child element
      // JS can't remove a parent only a child element
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      // querySelectorAll method returns a list, not an array
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
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
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      // print 4 peices of data DOM manipulation
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      // Show the user the percentage if greater than 0 or dashes when not
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      // Returns nodeList by selecting all and contains a length property
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      // anon function is passed into the callback parameter of nodeListForEach
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    // Date object constructor
    displayMonth: function() {
      var now, months, month, year;

      now = new Date();
      // var christmas = new Date(2018, 12, 25)

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "November",
        "December"
      ];
      month = now.getMonth(); // gives month number : zero based
      year = now.getFullYear(); // gets current full year

      // months[month] index gives getMonth number and lists what month aligns with index
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    // On expense '-' select change styles
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        // Each time type changes we want focus class to change
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
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

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    // Global document event listener for 'Enter key' to submit item
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    // DOM was reset in setupEventListeners function
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    // On change select event
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  // Called each time newItem is entered in UI
  var updateBudget = function() {
    // Calculate the budget
    budgetCtrl.calculateBudget();
    // Return the budget stored in a variable
    var budget = budgetCtrl.getBudget();
    // Display returned budget object (above) to UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // Calculate percentages
    budgetCtrl.calculatePercentages();

    // Read from budget controller
    var percentages = budgetCtrl.getPercentages();

    // Update UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

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

      // Caclulate and update percentages
      updatePercentages();
    }
  };

  // Still have access to the event object to locate the fired target element
  // Original fired target for the delete button is the icon, we want the whole parent element
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // Split the target HTML "id='inc-0'" into an array ['inc', '0']
      splitID = itemID.split("-");
      type = splitID[0];
      // Convert string number to integer
      ID = parseInt(splitID[1]);

      // Delete item from global data model
      budgetCtrl.deleteItem(type, ID);

      // Delete item from UI
      UICtrl.deleteListItem(itemID);

      // Update and show new budget
      updateBudget();

      // Caclulate and update percentages
      updatePercentages();
    }
  };

  // Page load initialization function
  return {
    init: function() {
      // Set budget to 0
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      // Start event listeners
      setupEventListeners();
    }
  };
})(budgetController, UIController);

// Call the controller.init object containing reset budget, event listeners, and date
controller.init();

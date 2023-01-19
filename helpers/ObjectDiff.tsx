export const diff = function (obj1, obj2) {
  if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
    return obj1
  }

  var diffs = {}
  var key

  var arraysMatch = function (arr1, arr2) {
    if (arr1.length !== arr2.length) return false

    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false
    }

    return true
  }

  var compare = function (item1, item2, key) {
    var type1 = Object.prototype.toString.call(item1)
    var type2 = Object.prototype.toString.call(item2)

    if (type2 === '[object Undefined]') {
      diffs[key] = null
      return
    }

    if (type1 !== type2) {
      diffs[key] = item2
      return
    }

    if (type1 === '[object Object]') {
      var objDiff = diff(item1, item2)
      if (Object.keys(objDiff).length > 0) {
        diffs[key] = objDiff
      }
      return
    }

    if (type1 === '[object Array]') {
      if (!arraysMatch(item1, item2)) {
        diffs[key] = item2
      }
      return
    }

    if (type1 === '[object Function]') {
      if (item1.toString() !== item2.toString()) {
        diffs[key] = item2
      }
    } else {
      if (item1 !== item2) {
        diffs[key] = item2
      }
    }
  }

  for (key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      compare(obj1[key], obj2[key], key)
    }
  }

  for (key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!obj1[key] && obj1[key] !== obj2[key]) {
        diffs[key] = obj2[key]
      }
    }
  }

  return diffs
}

var order1 = {
  sandwich: 'tuna',
  chips: true,
  drink: 'soda',
  order: 1,
  toppings: ['pickles', 'mayo', 'lettuce'],
  details: {
    name: 'Chris',
    phone: '555-555-5555',
    email: 'no@thankyou.com',
  },
  otherVal1: '1',
}

var order2 = {
  sandwich: 'turkey',
  chips: true,
  drink: 'soda',
  order: 2,
  toppings: ['pickles', 'lettuce'],
  details: {
    name: 'Jon',
    phone: '(555) 555-5555',
    email: 'yes@please.com',
  },
  otherVal2: '2',
}

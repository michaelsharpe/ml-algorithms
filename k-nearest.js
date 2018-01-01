// TODO refactor to make it all into pure functions
// TODO implement filtering for increased performance

class Node {
  constructor(obj) {
    for (const key in obj) {
      this[key] = obj[key]
    }
  }

  measureDistance(features) {
    this.neighbors = this.neighbors.map(neighbor => {
      const deltas = new Set()

      features.forEach((feature, key) => {
        deltas.add((neighbor[key] - this[key]) / feature.range)
      })

      neighbor.distance = Math.sqrt(Array.from(deltas).reduce((total, delta) => total + (delta * delta)))

      return neighbor
    })
  }

  sortByDistance() {
    this.neighbors.sort((a, b) => a.distance - b.distance)
  }

  guessType(k) {
    const types = new Map()

    this.neighbors.slice(0, k).map(neighbor => {
      if(!types.has(neighbor.type)){
        types.set(neighbor.type, 0)
      }

      types.set(neighbor.type, (types.get(neighbor.type) + 1))

      // Optomize this with map and reduce
      const guess = { type: false, count: 0 }

      for (const [type, value] of types) {
        if(value > guess.count) {
          guess.type = type
          guess.count = value
        }
      }

      this.guess = guess;

      console.log("guess", this.guess)
    })
  }
}

class NodeList {
  constructor(k) {
    this.nodes = []
    this.k = k
  }

  add(node) {
    this.nodes = [...this.nodes, node]
  }

  calculateRanges() {
    // Store features in an arrau of objects.  Each object has a type attribute rather than
    // being the key of an object.  There is one feature object per feature.
    const features = new Map()

    Object.entries(this.nodes[0]).forEach(([key, value]) => {
      if(!isNaN(value)) {
        features.set(key, {
          min: 1000000000,
          max: 0,
          range: 0
        })
      }
    })

    // Find max and min of each feature
    this.nodes.map(node => {
      features.forEach((feature, key) => {
        features.set(key, {
          min: Math.min(node[key], feature.min),
          max: Math.max(node[key], feature.max)
        })

        features.set(key, {
          ...features.get(key),
          range: feature.max - feature.min
        })
      })
    })

    this.features = features
  }

  determineUnknown() {
    this.calculateRanges()

    // find nodes that do not yet have a type, clone the list and measure distances
    this.nodes.filter(node => !node.type).map((node, i, arr) => {
      // Create neighbors form nodes that have a type already
      node.neighbors = this.nodes.filter(node1 => node1.type).map(node2 => new Node(node2))

      // measure distance from other nodes
      node.measureDistance(this.features)

      node.sortByDistance();

      console.log(node.guessType(this.k))
    })
  }
}

const dwelling = type => ([rooms, area]) => ({rooms, area, type})

const houseArray = [[7, 850], [7, 900], [7, 1200], [8, 1500], [9, 1300], [8, 1240], [10, 1700], [9, 1000]]
const flatArray = [[1, 800], [3, 900], [2, 700], [1, 900], [2, 1150], [1, 1000], [2, 1200], [1, 1300]]
const apartmentArray = [[1, 350], [2, 300], [3, 300], [4, 250], [4, 500], [4, 400], [5, 450]]

const data = [
  ...houseArray.map(dwelling("house")),
  ...flatArray.map(dwelling("flat")),
  ...apartmentArray.map(dwelling("apartment"))
]

var run = function() {
  const nodes= new NodeList(3)
  const normalizeData = (data) => data.map(obj => new Node(obj))

  normalizeData(data).map(node => {
    nodes.add(node)
  })

	var random_rooms = Math.round( Math.random() * 10 );
	var random_area = Math.round( Math.random() * 2000 );
	nodes.add( new Node({rooms: random_rooms, area: random_area, type: false}));

	nodes.determineUnknown();
}

run()

// Quick test to check if unit creation works
const fetch = require('node-fetch');

const testUnit = {
  unitNumber: "101",
  floor: 1,
  capacity: 1,
  rentPrice: 5000,
  description: "Test unit"
};

fetch('http://localhost:5000/api/units', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testUnit)
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));

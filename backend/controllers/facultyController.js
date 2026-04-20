const validFaculties = [
  "Faculty of Computing", "Faculty of architecture", "Faculty of Business", "Faculty of Humanity",
  "Management",  "Other"
];

const getFaculties = async (req, res) => {
  try {
    // Capitalize first letter for display
    const faculties = validFaculties.map(faculty => 
      faculty.charAt(0).toUpperCase() + faculty.slice(1).toLowerCase()
    );
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getFaculties };


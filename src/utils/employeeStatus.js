// Utility functions to determine employee visibility status

/**
 * Check if an employee should be hidden from the dashboard
 * @param {Object} employee - The employee object
 * @returns {boolean} - True if employee should be hidden, false otherwise
 */
export const isEmployeeHidden = (employee) => {
  if (!employee) return true;
  
  // Check for common status fields that indicate an employee is inactive
  const status = employee.status?.toLowerCase();
  const employmentStatus = employee.employmentStatus?.toLowerCase();
  const isActive = employee.isActive;
  
  // Hide if status indicates inactive, resigned, terminated, etc.
  if (status === 'inactive' || status === 'resigned' || status === 'terminated' || status === 'left') {
    return true;
  }
  
  // Hide if employmentStatus indicates inactive
  if (employmentStatus === 'inactive' || employmentStatus === 'resigned' || employmentStatus === 'terminated') {
    return true;
  }
  
  // Hide if isActive is explicitly false
  if (isActive === false) {
    return true;
  }
  
  // Hide if hidden flag is set
  if (employee.hidden === true) {
    return true;
  }
  
  return false;
};

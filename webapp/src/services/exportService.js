import { utils, write } from 'xlsx';

/**
 * Service for exporting drink data in various formats
 */
const exportService = {
  /**
   * Export data to Excel format
   * @param {Array} drinks - Array of drink objects to export
   * @param {string} filename - Filename for the exported file
   */
  exportToExcel(drinks, filename = null) {
    try {
      if (!drinks || drinks.length === 0) {
        console.warn('No data to export');
        return;
      }

      // Get today's date in YYYY-MM-DD format for filename if not specified
      const today = new Date().toISOString().split('T')[0];
      const defaultFilename = `${today}-drink-log.xlsx`;
      
      // Use provided filename or default
      filename = filename || defaultFilename;

      // Convert drinks to worksheet format
      const wsData = drinks.map(drink => {
        // Format timestamp components
        let date = 'N/A';
        let time = 'N/A';
        let timestamp = 'N/A';
        
        if (drink.timestamp) {
          const drinkDate = new Date(drink.timestamp.seconds * 1000);
          // Full ISO timestamp
          timestamp = drinkDate.toISOString();
          // Format date as YYYY-MM-DD
          date = drinkDate.toISOString().split('T')[0];
          // Format time as HH:MM:SS
          time = drinkDate.toTimeString().split(' ')[0];
        }
        
        // Format location
        const lat = drink.location?.lat || drink.location?.coordinates?.[1] || 'N/A';
        const lng = drink.location?.lng || drink.location?.coordinates?.[0] || 'N/A';
        
        return {
          'Brand': drink.brand || 'Unknown',
          'Type': drink.drinkType || 'Unknown',
          'Container': drink.containerType || drink.container || 'Unknown',
          'Amount': drink.amount || 'Unknown',
          'Rating': drink.rating || 'N/A',
          'Date': date,
          'Time': time,
          'Timestamp': timestamp,
          'Latitude': lat,
          'Longitude': lng,
          'Notes': drink.notes || '',
          'Added By': drink.username || 'Me'
        };
      });

      // Create worksheet
      const ws = utils.json_to_sheet(wsData);

      // Create workbook
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Drinks');

      // Generate Excel file
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create Blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  },

  /**
   * Export data to CSV format
   * @param {Array} data - Array of drink objects to export
   */
  exportToCsv: (data) => {
    try {
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }

      // Get today's date in YYYY-MM-DD format for filename
      const today = new Date().toISOString().split('T')[0];

      // Format data
      const formattedData = data.map(drink => {
        // Format timestamp components
        let date = 'N/A';
        let time = 'N/A';
        let timestamp = 'N/A';
        
        if (drink.timestamp) {
          const drinkDate = new Date(drink.timestamp.seconds * 1000);
          // Full ISO timestamp
          timestamp = drinkDate.toISOString();
          // Format date as YYYY-MM-DD
          date = drinkDate.toISOString().split('T')[0];
          // Format time as HH:MM:SS
          time = drinkDate.toTimeString().split(' ')[0];
        }
        
        // Format location
        const lat = drink.location?.lat || drink.location?.coordinates?.[1] || 'N/A';
        const lng = drink.location?.lng || drink.location?.coordinates?.[0] || 'N/A';
        
        return {
          Brand: drink.brand || 'Unknown',
          Type: drink.drinkType || 'Unknown',
          Container: drink.containerType || drink.container || 'Unknown',
          Amount: drink.amount || 'Unknown',
          Rating: drink.rating || 'N/A',
          Date: date,
          Time: time,
          Timestamp: timestamp,
          Latitude: lat,
          Longitude: lng,
          Notes: (drink.notes || '').replace(/,/g, ' '), // Remove commas to prevent CSV issues
        };
      });

      // Create CSV header
      const header = Object.keys(formattedData[0]).join(',');
      
      // Create CSV rows
      const rows = formattedData.map(item => 
        Object.values(item).join(',')
      );
      
      // Combine header and rows
      const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${today}-drink-log.csv`);
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  },
  
  /**
   * Export data to JSON format
   * @param {Array} data - Array of drink objects to export
   */
  exportToJson: (data) => {
    try {
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }

      // Get today's date in YYYY-MM-DD format for filename
      const today = new Date().toISOString().split('T')[0];

      // Format data to be more readable
      const formattedData = data.map(drink => {
        // Format timestamp components
        let date = null;
        let time = null;
        let timestamp = null;
        
        if (drink.timestamp) {
          const drinkDate = new Date(drink.timestamp.seconds * 1000);
          // Full ISO timestamp
          timestamp = drinkDate.toISOString();
          // Format date as YYYY-MM-DD
          date = drinkDate.toISOString().split('T')[0];
          // Format time as HH:MM:SS
          time = drinkDate.toTimeString().split(' ')[0];
        }
        
        // Format location
        const location = {};
        if (drink.location) {
          location.lat = drink.location.lat || drink.location.coordinates?.[1] || null;
          location.lng = drink.location.lng || drink.location.coordinates?.[0] || null;
        }
        
        return {
          id: drink.id,
          brand: drink.brand || null,
          drinkType: drink.drinkType || null,
          containerType: drink.containerType || drink.container || null,
          amount: drink.amount || null,
          rating: drink.rating || null,
          date: date,
          time: time,
          timestamp: timestamp,
          location: drink.location ? location : null,
          notes: drink.notes || null,
        };
      });

      // Create JSON string
      const jsonString = JSON.stringify(formattedData, null, 2);
      
      // Create download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${today}-drink-log.json`);
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
    }
  }
};

export { exportService }; 
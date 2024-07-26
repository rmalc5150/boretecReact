import React, { useState } from 'react';
import confetti from 'canvas-confetti'
import DatePicker from 'react-datepicker';
  
interface MarkAsRentedConfirmationProps {
  invoiceNumber: string;
  onHide: () => void;
  handleHideMarkAsRentedConfirmation: (dateExpected:Date)=> void;
}

  const MarkAsRentedConfirmation: React.FC<MarkAsRentedConfirmationProps> = ({ invoiceNumber, onHide, handleHideMarkAsRentedConfirmation }) => {
    const [isVisible, setIsVisible] = useState(true); // Control the visibility of the component
    const [status, setStatus] = useState('confirmation'); // Control the display of confirmation or processing message
    const [dateExpected, setDateExpected] = useState<Date | null>(null);
    const [reminders, setReminders] = useState({
      textMessages: true,
      email: true,
      sevenDaysBeforeDue: true,
      threeDaysBeforeDue: true,
      dueDate: true
    });

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = event.target;
      setReminders(prevState => ({
        ...prevState,
        [name]: checked
      }));
    };

    const hideComponentConfirm = () => setIsVisible(false);
  
    const triggerConfetti = () => {
        confetti({
          particleCount: 300,
          spread: 360,
          startVelocity: 55,
          origin: { y: 0.75 },
        })
    
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 360,
            startVelocity: 65,
            origin: { y: 0.5 },
          })
        }, 50)
    
        setTimeout(() => {
          confetti({
            particleCount: 500,
            spread: 360,
            startVelocity: 75,
            origin: { y: 0.25 },
          })
        }, 100)
        setTimeout(() => {
          confetti({
            particleCount: 500,
            spread: 360,
            startVelocity: 85,
            origin: { y: 0 },
          })
        }, 150) // Delay the third confetti by 30ms
    
        if (navigator.vibrate) {
          // Trigger haptic feedback
          navigator.vibrate(50) // Vibrate for 50ms
        }
      }


    const hideComponent = () => {
      // Call the onHide function passed from the parent component
      onHide();
    };

    const markRented = async () => {
      
    if (dateExpected) {
      setStatus('processing');
      // Pass dateExpected to parent component
      handleHideMarkAsRentedConfirmation(dateExpected);
    
      triggerConfetti();
      setTimeout(() => {
        hideComponentConfirm();
      }, 1000);
    } else {
      alert("You have to set an expected date.")
    }
    };
  
    if (!isVisible) return null;
  
    return (
      <div id={`confirm-${invoiceNumber}`} className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm flex items-center justify-center">
        <div className="w-full p-5">
          <div className="md:grid md:grid-cols-2">
        <div className="flex justify-center items-center">
            <div>
            <p className="px-2 text-center font-medium text-lg">
              Expected return date:
            </p>
          <DatePicker
            selected={dateExpected}
            onChange={setDateExpected}
            dateFormat="MM-dd-yy" // Customize the date format
            className={`text-center px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 border border-gray-300 w-full`} // Apply Tailwind or custom styling here
            wrapperClassName="date-picker" // Wrapper class for additional styling
            popperPlacement="top-end" // Customize the popper placement
          />
          </div>
          </div>
          <div className="flex justify-center items-center">
            <div>
            <p className="px-2 text-center font-medium text-lg">
              Reminders:
            </p>
            <div className="flex flex-col items-start">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="textMessages"
                    checked={reminders.textMessages}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-gray-800"
                  />
                  <span>Text messages</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="email"
                    checked={reminders.email}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-gray-800"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="sevenDaysBeforeDue"
                    checked={reminders.sevenDaysBeforeDue}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-gray-800"
                  />
                  <span>7 days before due</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="threeDaysBeforeDue"
                    checked={reminders.threeDaysBeforeDue}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-gray-800"
                  />
                  <span>3 days before due</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="dueDate"
                    checked={reminders.dueDate}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-gray-800"
                  />
                  <span>Due date</span>
                </label>
              </div>
            </div>
          </div>
        
          </div>
          <div className={`buttons flex justify-center items-center mt-5 ${status !== 'confirmation' ? 'hidden' : ''}`}>
            <button className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow rounded-lg" onClick={hideComponent}>Back</button>
            <button className="bg-gray-800 text-white hover:bg-black text-center py-1 m-1 flex-grow rounded-lg" onClick={markRented}>Mark as Rented</button>
          </div>
          <p className={`processing ${status !== 'processing' ? 'hidden' : ''} text-center`}>
            Processing...{invoiceNumber}
          </p>
        </div>
      </div>
    );
  };

  export default MarkAsRentedConfirmation
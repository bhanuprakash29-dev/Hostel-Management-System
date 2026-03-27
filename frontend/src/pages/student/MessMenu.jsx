import { useState, useEffect } from "react";
import axios from "axios";

const MessMenu = ({ user }) => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.get('https://hostel-management-system-11.onrender.com/api/mess/menu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMenu(res.data);
            } catch (err) {
                console.error("Error fetching mess menu", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [user]);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const fallbackMenu = {
        Monday: { breakfast: 'Idli, Sambar, Coconut Chutney, Filter Coffee', lunch: 'Rice, Dal Tadka, Aloo Gobi, Rasam, Curd, Papad', snacks: 'Masala Tea, Onion Pakora', dinner: 'Chapati, Palak Paneer, Jeera Rice, Raita', special: 'Gulab Jamun' },
        Tuesday: { breakfast: 'Dosa, Podi, Sambar, Tomato Chutney, Milk', lunch: 'Rice, Sambar, Beans Poriyal, Rasam, Buttermilk, Papad', snacks: 'Filter Coffee, Medu Vada', dinner: 'Chapati, Chole Masala, Steamed Rice, Onion Raita', special: 'Kesari Bath' },
        Wednesday: { breakfast: 'Pongal, Coconut Chutney, Sambar, Coffee', lunch: 'Rice, Kootu, Cabbage Poriyal, Rasam, Curd Rice', snacks: 'Tea, Bonda', dinner: 'Parotta, Vegetable Kurma, Lemon Rice, Papad', special: 'Payasam' },
        Thursday: { breakfast: 'Upma, Coconut Chutney, Boiled Egg, Filter Coffee', lunch: 'Rice, Moong Dal, Brinjal Curry, Rasam, Curd, Pickle', snacks: 'Masala Tea, Murukku', dinner: 'Chapati, Dal Makhani, Veg Pulao, Raita', special: 'Rava Laddu' },
        Friday: { breakfast: 'Pesarattu, Ginger Chutney, Upma, Tea', lunch: 'Rice, Sambar, Potato Podimas, Rasam, Buttermilk', snacks: 'Coffee, Bajji (Banana/Chili)', dinner: 'Chapati, Paneer Butter Masala, Jeera Rice, Salad', special: 'Badam Halwa' },
        Saturday: { breakfast: 'Poori, Aloo Masala, Pickle, Filter Coffee', lunch: 'Biryani, Raita, Mirchi Ka Salan, Boiled Egg', snacks: 'Tea, Samosa with Chutney', dinner: 'Dosa, Sambar, Tomato Chutney, Podi', special: 'Jangri / Imarti' },
        Sunday: { breakfast: 'Chole Bhature, Lassi, Pickle', lunch: 'Rice, Paneer Tikka Masala, Dal Fry, Rasam, Papad', snacks: 'Masala Chai, Mysore Bonda', dinner: 'Chapati, Mixed Veg Curry, Pulihora (Tamarind Rice), Curd', special: 'Double Ka Meetha' }
    };

    const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
    const todayData = menu.find(m => m.day === todayName) || fallbackMenu[todayName];

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-dark fw-bold mb-1">🍛 Mess Menu</h2>
                    <p className="text-muted mb-0">Discover what's cooking today and the rest of the week.</p>
                </div>
                <div className="d-none d-md-block text-end">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                        <i className="bi bi-geo-alt-fill me-1"></i> South Indian Block
                    </span>
                </div>
            </div>

            {/* Today's Featured Menu */}
            <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                    <h4 className="fw-bold mb-0 text-primary">Today's Highlights <span className="text-dark">({todayName})</span></h4>
                    {todayData.special && (
                        <span className="ms-3 badge bg-danger rounded-pill shadow-sm px-3 py-2 fw-bold animate__animated animate__pulse animate__infinite">
                            <i className="bi bi-star-fill me-1 text-warning"></i> Special: {todayData.special}
                        </span>
                    )}
                </div>

                <div className="row g-4">
                    {[
                        { title: 'Breakfast', time: '07:30 - 09:00 AM', items: todayData.breakfast, icon: 'bi-cup-hot', color: 'warning' },
                        { title: 'Lunch', time: '12:30 - 02:00 PM', items: todayData.lunch, icon: 'bi-egg-fried', color: 'success' },
                        { title: 'Snacks', time: '05:00 - 06:00 PM', items: todayData.snacks, icon: 'bi-cookie', color: 'info' },
                        { title: 'Dinner', time: '07:30 - 09:00 PM', items: todayData.dinner, icon: 'bi-moon-stars', color: 'primary' }
                    ].map((meal, idx) => (
                        <div className="col-md-6 col-xl-3" key={idx}>
                            <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift overflow-hidden position-relative">
                                <div className={`position-absolute top-0 end-0 p-3 opacity-10 bg-${meal.color} text-${meal.color} rounded-bottom-4 ms-auto`} style={{width: '60px', height: '60px'}}>
                                    <i className={`fs-1 ${meal.icon}`}></i>
                                </div>
                                <div className="card-body p-4">
                                    <div className={`d-flex align-items-center justify-content-center bg-${meal.color} bg-opacity-10 text-${meal.color} rounded-circle mb-3`} style={{ width: '50px', height: '50px' }}>
                                        <i className={`fs-4 fw-bold ${meal.icon}`}></i>
                                    </div>
                                    <h5 className="fw-bold mb-1">{meal.title}</h5>
                                    <p className="small text-muted mb-3"><i className="bi bi-clock me-1"></i> {meal.time}</p>
                                    
                                    <ul className="list-unstyled mb-0 border-top pt-3">
                                        {meal.items.split(', ').map((item, i) => (
                                            <li key={i} className="mb-2 d-flex align-items-start">
                                                <i className={`bi bi-check-circle-fill text-${meal.color} mt-1 me-2`} style={{fontSize: '0.8rem'}}></i>
                                                <span className="fw-medium text-dark">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Schedule */}
            <div>
                <h4 className="fw-bold mb-3 d-flex align-items-center text-secondary">
                    <i className="bi bi-calendar-week me-2"></i> Weekly Schedule
                </h4>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 px-4 fw-bold text-uppercase small text-muted border-0">Day</th>
                                    <th className="py-3 px-3 fw-bold text-uppercase small text-muted border-0">Breakfast</th>
                                    <th className="py-3 px-3 fw-bold text-uppercase small text-muted border-0">Lunch</th>
                                    <th className="py-3 px-3 fw-bold text-uppercase small text-muted border-0">Dinner</th>
                                    <th className="py-3 px-4 fw-bold text-uppercase small text-muted border-0 text-end">Special</th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.map(day => {
                                    const d = menu.find(m => m.day === day) || fallbackMenu[day];
                                    const isToday = day === todayName;
                                    return (
                                        <tr key={day} className={isToday ? "table-primary border-primary" : ""}>
                                            <td className="py-3 px-4 border-0">
                                                <div className="fw-bold text-dark">{day}</div>
                                                {isToday && <span className="badge bg-primary rounded-pill small">Today</span>}
                                            </td>
                                            <td className="py-3 px-3 border-0">
                                                <small className="text-secondary fw-medium">{d.breakfast}</small>
                                            </td>
                                            <td className="py-3 px-3 border-0">
                                                <small className="text-secondary fw-medium">{d.lunch}</small>
                                            </td>
                                            <td className="py-3 px-3 border-0">
                                                <small className="text-secondary fw-medium">{d.dinner}</small>
                                            </td>
                                            <td className="py-3 px-4 border-0 text-end">
                                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1">
                                                    <i className="bi bi-star-fill me-1"></i>{d.special}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessMenu;

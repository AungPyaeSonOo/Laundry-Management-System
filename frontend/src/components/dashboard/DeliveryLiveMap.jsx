import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orderApi } from '../../api';
import { formatShortDate } from '../../utils/helpers';
import 'leaflet/dist/leaflet.css';

// ✅ Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ✅ Custom Icons for Pickup and Delivery
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ✅ Component to fit map bounds to markers
const FitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.location.lat, m.location.lng]));
            map.fitBounds(bounds, { padding: [30, 30] });
        } else {
            // Default view if no markers (Yangon center)
            map.setView([16.8661, 96.1951], 13);
        }
    }, [markers, map]);
    return null;
};

const DeliveryLiveMap = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchDeliveries = async () => {
        try {
            const response = await orderApi.getActiveDeliveries();
            setDeliveries(response.data.data || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching live deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();

        // ✅ Refresh every 10 seconds for live tracking
        intervalRef.current = setInterval(fetchDeliveries, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Map Center (Default Yangon)
    const center = [16.8661, 96.1951];

    if (loading) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-secondary small">Loading live locations...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white d-flex flex-wrap justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center gap-3">
                    <h6 className="fw-bold mb-0">
                        <span className="me-2">📍</span> Live Delivery Tracking
                    </h6>
                    <Badge bg="primary" className="rounded-pill">
                        {deliveries.length} Active
                    </Badge>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="d-flex align-items-center gap-1">
                            <span className="d-inline-block" style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
                            <small className="text-secondary">Pickup</small>
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <span className="d-inline-block" style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
                            <small className="text-secondary">Delivery</small>
                        </span>
                    </div>
                    {lastUpdated && (
                        <small className="text-secondary">
                            Updated: {formatShortDate(lastUpdated)}
                        </small>
                    )}
                </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ height: '350px', position: 'relative' }}>
                {deliveries.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary bg-light">
                        <span style={{ fontSize: '40px' }}>🗺️</span>
                        <p className="mt-2 mb-0">No active delivery personnel at the moment.</p>
                    </div>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {deliveries.map((delivery) => (
                            <Marker
                                key={delivery.order_id}
                                position={[delivery.location.lat, delivery.location.lng]}
                                icon={delivery.task_type === 'pickup' ? pickupIcon : deliveryIcon}
                            >
                                <Popup>
                                    <div style={{ minWidth: '200px' }}>
                                        <div className="fw-bold">
                                            {delivery.task_type === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}
                                        </div>
                                        <div><strong>Order:</strong> #{delivery.order_number}</div>
                                        <div><strong>Customer:</strong> {delivery.customer_name}</div>
                                        <div><strong>Driver:</strong> {delivery.delivery_person}</div>
                                        <div><strong>Address:</strong> {delivery.customer_address}</div>
                                        <div className="text-secondary small mt-1">
                                            Status: <Badge bg="secondary">{delivery.status}</Badge>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        <FitBounds markers={deliveries} />
                    </MapContainer>
                )}
            </Card.Body>
        </Card>
    );
};

export default DeliveryLiveMap;
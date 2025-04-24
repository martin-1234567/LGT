import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
// src/App.js
const API_URL = process.env.REACT_APP_API_URL;
console.log('🚀 [DEBUG] API_URL =', API_URL);
Modal.setAppElement("#root");

const vehicles = Array.from({ length: 12 }, (_, i) => `M${(i + 1).toString().padStart(2, '0')}`);
const systemesDisponibles = [
  "V71.CAIA-MECA",
  "V71.FREA-FREIN",
  "V71.ORRA-MECA",
  "V71.ECLA-ELEC",
  "V71.EQAA-ELEC",
  "V71.HACA-MECA",
  "V71.ORRA-ELEC",
  "V71.LICA-MECA",
  "V71.POAA-MECA",
];

function App() {
  const [vehiculeActif, setVehiculeActif] = useState(null);
  const [pointsConfirmes, setPointsConfirmes] = useState([]);
  const [pointTemporaire, setPointTemporaire] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [systemeChoisi, setSystemeChoisi] = useState(null);
  const [operations, setOperations] = useState([]);
  const [operationChoisie, setOperationChoisie] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [afficherPleinEcran, setAfficherPleinEcran] = useState(false);
  const [isTracabilite, setIsTracabilite] = useState(false);
  const [outillages, setOutillages] = useState([]);
  const [piecesDetachees, setPiecesDetachees] = useState([]);
  const imageRef = useRef(null);

  const handleClickVehicule = (vehicule) => {
    setVehiculeActif(vehicule);
    setPointTemporaire(null);
    setSystemeChoisi(null);
    setOperationChoisie(null);
    setPdfUrl(null);
    setOutillages([]);
    setPiecesDetachees([]);
  };

  const handleClickPlan = (e) => {
    e.stopPropagation();
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPointTemporaire({ vehicule: vehiculeActif, x: x.toFixed(2), y: y.toFixed(2) });
    setSystemeChoisi(null);
    setOperationChoisie(null);
    
  };

  const handleOuvrirEnregistrement = () => setModalIsOpen(true);

  const handleChoisirSysteme = async (sys, operationInitiale = null) => {
    setSystemeChoisi(sys);
    setOperationChoisie(null);
    setPdfUrl(null);
    setOperations([]);
    setOutillages([]);
    setPiecesDetachees([]);

    try {
      const res = await axios.get(`${API_URL}/api/operations?systeme=${encodeURIComponent(sys)}`);
      console.log('📦 [DEBUG] res.data =', res.data);
      setOperations(res.data);
      if (operationInitiale && res.data.includes(operationInitiale)) {
        setOperationChoisie(operationInitiale);

        // Appel API details pour récupérer pièces et outillages
        try {
          const detailsRes = await axios.get(
            `${API_URL}/api/details?systeme=${encodeURIComponent(sys)}&operation=${encodeURIComponent(operationInitiale)}`
          );

          setPiecesDetachees(detailsRes.data.pieces || []);
          setOutillages(detailsRes.data.outillages || []);
        } catch (detailsErr) {
          console.error("Erreur lors de la récupération des détails :", detailsErr);
        }
      }
      
    } catch (err) {
      console.error("Erreur lors de la récupération des opérations :", err);
    }
  };
  const handleChangeOperation = async (op) => {
    setOperationChoisie(op);
    setPdfUrl(null); // Réinitialise la vue PDF
  
    try {
      const detailsRes = await axios.get(
        `${API_URL}/api/details?systeme=${encodeURIComponent(systemeChoisi)}&operation=${encodeURIComponent(op)}`
      );
  
      setPiecesDetachees(detailsRes.data.pieces || []);
      setOutillages(detailsRes.data.outillages || []);
    } catch (err) {
      console.error("Erreur lors du chargement des détails :", err);
    }
  };
  

  const handleValiderSysteme = () => {
    if (!systemeChoisi || !operationChoisie || !pointTemporaire) return;

    const updatedPoints = pointsConfirmes.filter(
      (p) => !(p.x === pointTemporaire.x && p.y === pointTemporaire.y && p.vehicule === pointTemporaire.vehicule)
    );

    const pointFinal = {
      ...pointTemporaire,
      systeme: systemeChoisi,
      operation: operationChoisie,
    };

    setPointsConfirmes([...updatedPoints, pointFinal]);
    setModalIsOpen(false);
    setPointTemporaire(null);
    setSystemeChoisi(null);
    setOperationChoisie(null);
    setPdfUrl(null);
    setOutillages([]);
    setPiecesDetachees([]);
  };

  const handleSupprimerPoint = () => {
    const updatedPoints = pointsConfirmes.filter(
      (p) => !(p.x === pointTemporaire.x && p.y === pointTemporaire.y && p.vehicule === pointTemporaire.vehicule)
    );
    setPointsConfirmes(updatedPoints);
    setModalIsOpen(false);
    setPointTemporaire(null);
    setSystemeChoisi(null);
    setOperationChoisie(null);
    setPdfUrl(null);
    setOutillages([]);
    setPiecesDetachees([]);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (systemeChoisi && operationChoisie) {
        try {
          const res = await axios.get(`${API_URL}/api/details?systeme=${encodeURIComponent(systemeChoisi)}&operation=${encodeURIComponent(operationChoisie)}`);
          setOutillages(res.data.outillages || []);
          setPiecesDetachees(res.data.pieces || []);
        } catch (err) {
          console.error("Erreur récupération détails :", err);
          setOutillages([]);
          setPiecesDetachees([]);
        }
      }
    };

    fetchDetails();
  }, [systemeChoisi, operationChoisie]);

  if (afficherPleinEcran && pdfUrl) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "black", zIndex: 9999 }}>
        <button
          onClick={() => {
            setAfficherPleinEcran(false);
            setIsTracabilite(false);
          }}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#ffc107",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            zIndex: 10000
          }}
        >
          🔙 Retour à l'application
        </button>
        <h2 style={{ color: "white", textAlign: "center", marginTop: "60px" }}>
          {isTracabilite ? "🧾 Traçabilité" : "📄 Protocole"}
        </h2>
        <iframe
          src={pdfUrl}
          title="Document plein écran"
          width="100%"
          height="100%"
          style={{ border: "none", marginTop: "10px" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Application LGT Maintenance</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {vehicles.map((vehicule) => (
          <button
            key={vehicule}
            onClick={() => handleClickVehicule(vehicule)}
            style={{
              padding: "20px",
              fontSize: "18px",
              backgroundColor: vehicule === vehiculeActif ? "#1b5e20" : "#2d89ef",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {vehicule}
          </button>
        ))}
      </div>

      {vehiculeActif && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <h2>Plan du véhicule {vehiculeActif}</h2>
          <img
            ref={imageRef}
            src={`/plans/plan_${vehiculeActif}.png`}
            alt={`Plan ${vehiculeActif}`}
            onClick={handleClickPlan}
            style={{
              maxWidth: "100%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "crosshair",
            }}
          />

          {pointsConfirmes.filter((p) => p.vehicule === vehiculeActif).map((point, index) => (
            <div
              key={index}
              title={`Cliquez pour modifier : ${point.systeme} - ${point.operation}`}
              onClick={() => {
                setPointTemporaire(point);
                setVehiculeActif(point.vehicule);
                setSystemeChoisi(point.systeme);
                setOperationChoisie(null);
                handleChoisirSysteme(point.systeme, point.operation);
                setModalIsOpen(true);
              }}
              style={{
                position: "absolute",
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
                width: "15px",
                height: "15px",
                backgroundColor: "green",
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 0 5px black",
                cursor: "pointer",
              }}
            />
          ))}

          {pointTemporaire && pointTemporaire.vehicule === vehiculeActif && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: `${pointTemporaire.x}%`,
                  top: `${pointTemporaire.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: "15px",
                  height: "15px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                  border: "2px solid white",
                  boxShadow: "0 0 5px black",
                }}
              />
              <button
                onClick={handleOuvrirEnregistrement}
                style={{
                  position: "absolute",
                  left: `${parseFloat(pointTemporaire.x) + 1}%`,
                  top: `${parseFloat(pointTemporaire.y) + 1}%`,
                  transform: "translate(-50%, -50%)",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#ffc107",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Nouvel enregistrement
              </button>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Choix du système"
        style={{ content: { width: "600px", margin: "auto", padding: "20px", borderRadius: "12px" } }}
      >
        <h2>Choisir un système</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {systemesDisponibles.map((sys) => (
            <button
              key={sys}
              onClick={() => handleChoisirSysteme(sys)}
              style={{
                padding: "10px",
                backgroundColor: sys === systemeChoisi ? "#1b5e20" : "#e0e0e0",
                color: sys === systemeChoisi ? "white" : "black",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {sys}
            </button>
          ))}
        </div>

        {systemeChoisi && operations.length > 0 && (
          <>
            <h3>Choisir une opération</h3>
            <select
              value={operationChoisie || ""}
              onChange={(e) => handleChangeOperation(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
            >
              <option value="">-- Sélectionner une opération --</option>
              {operations.map((op, index) => (
                <option key={index} value={op}>{op}</option>
              ))}
            </select>
          </>
        )}

        {operationChoisie && (
          <>
            <h3>📦 Pièces détachées</h3>
            <ul>
              {piecesDetachees.length > 0 ? (
                piecesDetachees.map((item, index) => (
                  <li key={index} style={{ marginLeft: "20px" }}>{item}</li>
                ))
              ) : (
                <p style={{ marginLeft: "20px", fontStyle: "italic" }}>Aucune pièce détachée trouvée.</p>
              )}
            </ul>

            <h3>🛠️ Outillages</h3>
            <ul>
              {outillages.length > 0 ? (
                outillages.map((item, index) => (
                  <li key={index} style={{ marginLeft: "20px" }}>{item}</li>
                ))
              ) : (
                <p style={{ marginLeft: "20px", fontStyle: "italic" }}>Aucun outillage trouvé.</p>
              )}
            </ul>
          </>
        )}

        {systemeChoisi && operationChoisie && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => {
                setPdfUrl(`${API_URL}/fichier?systeme=${encodeURIComponent(systemeChoisi)}&operation=${encodeURIComponent(operationChoisie)}&type=protocole`);
                setIsTracabilite(false);
                setAfficherPleinEcran(true);
              }}
              style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px" }}
            >
              📄 Voir le protocole
            </button>

            <button
              onClick={() => {
                setPdfUrl(`${API_URL}/fichier?systeme=${encodeURIComponent(systemeChoisi)}&operation=${encodeURIComponent(operationChoisie)}&type=tracabilite`);
                setIsTracabilite(true);
                setAfficherPleinEcran(true);
              }}
              style={{ padding: "10px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px" }}
            >
              🧾 Voir la traçabilité
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button
            onClick={handleValiderSysteme}
            disabled={!systemeChoisi || !operationChoisie}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1b5e20",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: systemeChoisi && operationChoisie ? "pointer" : "not-allowed"
            }}
          >
            Valider
          </button>
          {pointTemporaire && (
            <button
              onClick={handleSupprimerPoint}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Supprimer ce point
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default App;

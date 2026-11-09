import React, { useState } from "react";
import CustomButton from "../CustomButton/CustomButton.component";
import { db } from "../../firebase/firebase.utils";
import { doc, updateDoc } from "firebase/firestore";

function DraftOrder({ players }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Use the players prop from parent (which is updated via real-time listeners)
  // instead of maintaining our own local state

  async function setDraftOrder(event) {
    event.preventDefault();
    setIsUpdating(true);
    const playerOrders = event.target;

    try {
      const updatePromises = [];

      for (let player of playerOrders) {
        if (player.id !== "" && player.value !== "") {
          let playerIndex = players.findIndex(
            (selectedPlayer) => selectedPlayer.docId === player.id
          );

          if (playerIndex !== -1) {
            // Add database update to promises array
            const playerDocRef = doc(db, "players", players[playerIndex].docId);
            updatePromises.push(
              updateDoc(playerDocRef, {
                draftOrder: player.value,
              })
            );
          }
        }
      }

      // Wait for all database updates to complete
      await Promise.all(updatePromises);

      // Force re-render to show updated order
      setUpdateCounter((prev) => prev + 1);


      // Real-time listeners will automatically update all browser instances
      // No need to manually trigger refresh
    } catch (error) {
      console.error("Error updating draft order:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className='draft-order'>
      <h3>Draft Order</h3>
      <form
        onSubmit={(event) => {
          setDraftOrder(event);
        }}
      >
        {players.map((player) => (
          <div
            key={`${player.id}-${player.draftOrder}-${updateCounter}`}
            className='draft-order__list-item'
          >
            <label htmlFor={player.id}>{player.id}</label>
            <input
              className='orderInputs'
              type='number'
              id={player.docId}
              name={player.id}
              min='1'
              max='8'
              placeholder={player.draftOrder}
            />
          </div>
        ))}

        <CustomButton type='submit' disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Set Order"}
        </CustomButton>
      </form>
    </div>
  );
}
export default DraftOrder;

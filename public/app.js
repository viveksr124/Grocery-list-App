document.addEventListener( 'DOMContentLoaded', () => {
    const groceryForm = document.getElementById( 'grocery-form' );
    const groceryList = document.getElementById( 'grocery-list' );

    // Fetch all grocery items
    async function fetchItems() {
        try {
            const response = await fetch( '/api/items' );
            const items = await response.json();
            groceryList.innerHTML = '';
            items.forEach( item => {
                addItemToDOM( item );
            } );
        } catch ( err ) {
            console.error( 'Error fetching items:', err );
        }
    }

    // Add new item
    groceryForm.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();

        const nameInput = document.getElementById( 'item-name' );
        const quantityInput = document.getElementById( 'item-quantity' );

        const newItem = {
            name: nameInput.value,
            quantity: parseInt( quantityInput.value )
        };

        try {
            const response = await fetch( '/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( newItem )
            } );

            if ( response.ok ) {
                const item = await response.json();
                addItemToDOM( item );
                nameInput.value = '';
                quantityInput.value = '1';
            }
        } catch ( err ) {
            console.error( 'Error adding item:', err );
        }
    } );

    // Add item to DOM
    function addItemToDOM( item ) {
        const li = document.createElement( 'li' );
        li.innerHTML = `
<span>${ item.quantity }x ${ item.name }</span>
<button class="delete-btn" data-id="${ item._id }">Delete</button>
`;
        groceryList.appendChild( li );

        // Add delete event
        li.querySelector( '.delete-btn' ).addEventListener( 'click', async ( e ) => {
            const id = e.target.getAttribute( 'data-id' );
            try {
                await fetch( `/api/items/${ id }`, {
                    method: 'DELETE'
                } );
                li.remove();
            } catch ( err ) {
                console.error( 'Error deleting item:', err );
            }
        } );
    }

    // Initial fetch
    fetchItems();
} );
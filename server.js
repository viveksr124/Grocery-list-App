require( 'dotenv' ).config();
const path = require( 'path' );
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const cors = require( 'cors' );

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use( cors() );
app.use( express.json() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

// MongoDB Connection (updated version)
mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost:27017/grocerylist" )
    .then( () => console.log( 'Connected to MongoDB Docker container' ) )
    .catch( err => console.error( 'Connection error:', err ) );

const db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'MongoDB connection error:' ) );

// Grocery Item Schema
const groceryItemSchema = new mongoose.Schema( {
    name: String,
    quantity: Number,
    addedAt: {
        type: Date,
        default: Date.now
    }
} );

const GroceryItem = mongoose.model( 'GroceryItem', groceryItemSchema );

// API Routes
app.get( '/api/items', async ( req, res ) => {
    try {
        const items = await GroceryItem.find().sort( { addedAt: -1 } );
        res.json( items );
    } catch ( err ) {
        res.status( 500 ).json( { message: err.message } );
    }
} );

app.post( '/api/items', async ( req, res ) => {
    const item = new GroceryItem( {
        name: req.body.name,
        quantity: req.body.quantity || 1
    } );

    try {
        const newItem = await item.save();
        res.status( 201 ).json( newItem );
    } catch ( err ) {
        res.status( 400 ).json( { message: err.message } );
    }
} );

app.delete( '/api/items/:id', async ( req, res ) => {
    try {
        await GroceryItem.findByIdAndDelete( req.params.id );
        res.json( { message: 'Item deleted' } );
    } catch ( err ) {
        res.status( 500 ).json( { message: err.message } );
    }
} );

app.get( '*', ( req, res ) => {
    res.sendFile( path.join( __dirname, 'public', 'index.html' ) );
} );

// Start server
app.listen( PORT, () => {
    console.log( `Server running on port ${ PORT }` );
} );
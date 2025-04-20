# Import the Recursive Tesseract Hashing (RTH) method
from rth import recursive_tesseract_hash  # Assuming rth.py is in the same directory

class Ledger:
    def __init__(self):
        self.chain = []

    def add_block(self, node_id, state_hash, timestamp):
        # Create the block data (encode as bytes)
        block_data = f'{node_id}|{state_hash.hex()}|{timestamp}'.encode()

        # Generate the state hash using Recursive Tesseract Hashing (RTH)
        state_hash = recursive_tesseract_hash(block_data, depth=4)  # Use depth = 4 for 4D compression

        # Add the block to the chain
        self.chain.append({
            'node': node_id,
            'hash': state_hash,  # Use the state hash here (RTH hash)
            'timestamp': timestamp
        })

    def last_hash(self):
        # Return the hash of the last block in the chain
        return self.chain[-1]['hash'] if self.chain else b'\x00' * 32  # Default empty hash if chain is empty

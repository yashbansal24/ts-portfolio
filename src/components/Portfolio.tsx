import { Modal, useModal, Button, Text, Spacer } from "@nextui-org/react";
import { FaNewspaper } from 'react-icons/fa';

export default function Portfolio(props) {
  return (
    <div>
      <Modal
        scroll
        width="600px"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={props.isOpen}
      >
        <Modal.Header>
          <Text id="modal-title" size={18} style={{'marginRight': '10px'}}>
            Patents  
          </Text>
          <FaNewspaper size={30}/>
          
        </Modal.Header>
        <Modal.Body>
        <Text h4 id="modal-description">
        Reducing computing calls for webpage load times and resources
        </Text>
          <Text h6 id="modal-description">
            - US 17393941.
          </Text>
          <Text h4 id="modal-description">
          Systems and methods for using machine learning to determine an origin of a code
        </Text>
        <Text h6 id="modal-description">
            - US 10956698.
        </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto onPress={() => props.setVisible(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

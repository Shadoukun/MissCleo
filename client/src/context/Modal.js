import React, { useCallback, useState } from 'react'
import { Fade, Backdrop, StyledModal } from '../components/Modal'


const ModalContext = React.createContext()

export const renderBackdrop = (props) => <Backdrop {...props} />;

const ModalProvider = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const [modalProps, setModalProps] = useState({})


  const showModal = ({ content: Component, contentProps = {}, newModalProps = {} }) => {

    setModalContent((() => <Component {...contentProps} />))
    setModalProps(newModalProps)
    setIsOpen(true)
  }

  const hideModal = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <ModalContext.Provider value={{ showModal, hideModal }} {...props} >
      {props.children}

      <StyledModal
        show={isOpen}
        onHide={hideModal}
        transition={Fade}
        backdropClassName="backdrop"
        backdropTransition={Fade}
        renderBackdrop={renderBackdrop}
        aria-labelledby="modal-label"
        {...modalProps}
      >
        {modalContent}
      </StyledModal>
    </ModalContext.Provider>
  )
}

// custom Hook to provide context to functional components.
const useModal = () => {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider. Idiot.')
  }
  return context
}

export { ModalProvider, useModal }

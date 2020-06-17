import React, { useCallback, useState } from 'react'
import { Fade, Backdrop, StyledModal } from '../components/Modal'


type ModalContextProps = {
  showModal: (arg0: ShowModalProps) => void;
  hideModal: () => void;
}

type ProviderProps = {
  children: JSX.Element[] | JSX.Element
}

type ShowModalProps = {
  content: React.ReactNode // the component for the body of the modal.
  contentProps: {} // props for the content component.
  modalProps: {} // props for the modal itself.
}

const ModalContext = React.createContext<Partial<ModalContextProps>>({});

export const renderBackdrop = (props: any) => <Backdrop {...props} />;

const ModalProvider = (props: ProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<JSX.Element>()
  const [modalProps, setModalProps] = useState({})

  const showModal = ({ content, contentProps, modalProps}: ShowModalProps) => {
    const ContentComponent = content as React.ComponentClass

    setModalContent((() => <ContentComponent {...contentProps} />))
    setModalProps(modalProps)
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
  return context as ModalContextProps
}

export { ModalProvider, useModal }

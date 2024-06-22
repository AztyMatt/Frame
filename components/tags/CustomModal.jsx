import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet, Modal, View, Pressable, Image } from 'react-native'
import OutsidePressHandler from 'react-native-outside-press'

const CustomModal = forwardRef(({ content, handleModalData }, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isDataFetched, setIsDataFetched] = useState(false)

    const openModal = () => {
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
    }

    useImperativeHandle(ref, () => ({
        openModal: openModal,
        closeModal: closeModal
    }))

    if (handleModalData) { // If handleModalData, execute it
        useEffect(() => { // Needs to be improved, maybe by including the call and the storing of the data in this component directly
            if (isModalVisible && !isDataFetched) { // Currently making the call once, when the modal is open for the first time
                handleModalData()
                setIsDataFetched(true)
            }
        }, [isModalVisible])
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={closeModal}
            presentationStyle='overFullScreen'
        >
            <View style={styles.modalBackground}>
                    <View>
                        <OutsidePressHandler
                            onOutsidePress={() => {
                                closeModal()
                            }}
                        >
                            {content}
                        </OutsidePressHandler>
                    </View>
            </View>
        </Modal>
    )
})
export default CustomModal

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        // flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)' 
    }
})
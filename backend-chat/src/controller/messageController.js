const messageService = require('../services/messageService');

const createMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const messageData = {
            ...req.body,
            usuario_id: userId
        };

        const message = await messageService.createMessage(messageData);
        res.status(201).json({ message: "Mensaje creado exitosamente", message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMessagesByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await messageService.getMessagesByGroup(groupId);
        res.json({ messages });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const result = await messageService.deleteMessage(messageId, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createMessage,
    getMessagesByGroup,
    deleteMessage
};

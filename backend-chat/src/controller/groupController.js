const groupService = require('../services/groupService');

const createGroup = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const groupData = {
            ...req.body,
            creador_id: userId
        };

        const group = await groupService.createGroup(groupData);
        res.status(201).json({ message: "Grupo creado exitosamente", group });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getGroups = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log('getGroups - userId:', userId);
        console.log('getGroups - req.user:', req.user);
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const groups = await groupService.getGroups(userId);
        console.log('getGroups - groups:', groups);
        res.json({ groups });
    } catch (error) {
        console.error('getGroups - error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await groupService.getGroupById(groupId);
        res.json({ group });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { usuario_id } = req.body;

        const member = await groupService.addMemberToGroup(groupId, usuario_id);
        res.status(201).json({ message: "Miembro agregado exitosamente", member });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const members = await groupService.getGroupMembers(groupId);
        res.json({ members });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const result = await groupService.deleteGroup(groupId, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    addMemberToGroup,
    getGroupMembers,
    deleteGroup
};

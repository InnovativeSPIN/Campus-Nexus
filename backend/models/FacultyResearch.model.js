import { DataTypes } from 'sequelize';

const FacultyResearch = (sequelize) => {
    const Research = sequelize.define('FacultyResearch', {
        research_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        faculty_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'faculty_profiles',
                key: 'faculty_id'
            }
        },
        category: {
            type: DataTypes.ENUM('Conference', 'Journal', 'Patent', 'Book Chapter'),
            allowNull: false,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        author_names: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Comma-separated author names'
        },
        abstract: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        keywords: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        publication_date: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        publisher_organizer: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        issn_isbn: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        volume_issue: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        pages: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('International', 'National'),
            defaultValue: 'International',
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Published', 'Under Review', 'Accepted', 'Rejected'),
            defaultValue: 'Published',
        },
        research_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'e.g., Original Research, Review, Case Study'
        },
        impact_factor: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        citations: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        indexed_in: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'e.g., SCI, SCOPUS, WoS'
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        document_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ORCID_ID: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        tableName: 'faculty_research',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Research;
};

export default FacultyResearch;

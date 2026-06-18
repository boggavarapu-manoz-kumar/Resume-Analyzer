def get_skill_recommendations(missing_skills):
    """Maps missing skills to certification recommendations and learning paths."""
    recommendation_map = {
        'docker': {
            'cert': 'Docker Certified Associate (DCA)',
            'path': 'Learn Docker containerization, images, volumes, and networking configurations.'
        },
        'kubernetes': {
            'cert': 'Certified Kubernetes Administrator (CKA)',
            'path': 'Learn orchestration, pod management, deployments, and cluster configurations.'
        },
        'aws': {
            'cert': 'AWS Certified Solutions Architect - Associate',
            'path': 'Study cloud fundamentals, EC2, S3, IAM, and VPC structures.'
        },
        'gcp': {
            'cert': 'Google Associate Cloud Engineer',
            'path': 'Learn GCP compute engines, cloud storage, IAM, and cloud operations.'
        },
        'spring boot': {
            'cert': 'VMware Certified Professional - Application Modernization',
            'path': 'Master Java Spring Boot REST endpoints, JPA, and secure configuration.'
        },
        'react': {
            'cert': 'Meta Front-End Developer Certificate',
            'path': 'Master component lifecycles, states, hooks, Context API, and virtual DOM.'
        },
        'machine learning': {
            'cert': 'TensorFlow Developer Certificate',
            'path': 'Study regression, classification, clustering, neural networks, and model evaluations.'
        },
        'sql': {
            'cert': 'Oracle Database SQL Certified Associate',
            'path': 'Study join queries, grouping, indexing, and transaction management.'
        },
        'postgresql': {
            'cert': 'PostgreSQL Associate Certification',
            'path': 'Learn PG installation, query execution plans, indexes, and replication.'
        }
    }
    
    recommendations = []
    for skill in missing_skills:
        skill_lower = skill.lower()
        if skill_lower in recommendation_map:
            rec = recommendation_map[skill_lower]
            recommendations.append({
                "skill": skill,
                "certification": rec["cert"],
                "learning_path": rec["path"]
            })
        else:
            # General fallback recommendation
            recommendations.append({
                "skill": skill,
                "certification": f"Professional certification in {skill}",
                "learning_path": f"Study intermediate-to-advanced courses in {skill} to master basic core features."
            })
            
    return recommendations

'use client';

import { motion } from 'framer-motion';

export default function TeamGrid() {
  const teamMembers = [
    {
      name: 'Kathy Kapalakasha',
      position: 'School Director',
      department: 'Leadership',
      image: '/images/team/kathy.png',
      bio: 'Kathy leads the academy with a heart for Christ-centered learning, academic excellence, and the holistic growth of every child.',
      phone: '+260 761 370 566',
      email: 'info@regcoschristianacademy.com'
    },
    // {
    //   name: 'name name',
    //   position: 'Sales Lead',
    //   department: 'Sales',
    //   image: '/images/team/grace-phiri.jpg', // TODO: Add professional photo of Sales Lead Grace Phiri
    //   bio: 'Name leads our sales efforts and has helped hundreds of clients find their perfect plots across our estates.',
    //   phone: '+260 97 234 5678',
    //   email: 'name@calmmountainproperties.com'
    // }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl font-bold text-[#063B82] mb-6">Meet Our Leadership</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our leadership team is dedicated to creating a safe, nurturing, and faith-filled environment where every child can thrive.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-12 max-w-2xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <img 
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover object-center rounded-lg"
              />
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#063B82] mb-2">{member.name}</h3>
                  <p className="text-[#FFD400] font-semibold mb-1">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.department} Department</p>
                </div>
                
                <p className="text-gray-700 text-center mb-6 leading-relaxed">{member.bio}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <i className="ri-phone-line text-[#FFD400] mr-3"></i>
                    <a href={`tel:${member.phone}`} className="text-gray-700 hover:text-[#FFD400] transition-colors cursor-pointer">
                      {member.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-center">
                    <i className="ri-mail-line text-[#FFD400] mr-3"></i>
                    <a href={`mailto:${member.email}`} className="text-gray-700 hover:text-[#FFD400] transition-colors cursor-pointer">
                      {member.email}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
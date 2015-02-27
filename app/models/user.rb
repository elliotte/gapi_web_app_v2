class User < ActiveRecord::Base
	has_many :circles,  dependent: :destroy

	def self.join_and_create(email, google_id)

		user = User.new(email: email, google_id: google_id)
		user.save

		drive = $client.discovered_api('drive', 'v2')
        team_members = TeamMember.all.where(google_id: user.google_id)

        if team_members.present?
	        team_members.each do |team_member|
		      	teamfiles = team_member.circle.team_files
	            if teamfiles
	              teamfiles.each do |teamfile|
		                new_permission = drive.permissions.insert.request_schema.new({
		                  'value' => user.email,
		                  'type' => "user",
		                  'role' => "reader"
		                })

		                result = $client.execute(:api_method => drive.permissions.insert,
		                            :body_object => new_permission,
		                            :parameters => { 'fileId' => teamfile.file_id })
	              end
	            end
	        end
        end

	end

end



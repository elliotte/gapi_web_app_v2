class Circle < ActiveRecord::Base
	
	belongs_to :user
	has_many :team_members, dependent: :destroy
	has_many :team_files, dependent: :destroy
	has_many :messages, dependent: :destroy
	has_many :wallpins, dependent: :destroy

	def self.share_team_files client, user, teamfiles
		drive = client.discovered_api('drive', 'v2')
		team_name = Circle.find(teamfiles.first.circle_id).display_name
		teamfiles.each do |teamfile|
          		files_shared = true
                new_permission = drive.permissions.insert.request_schema.new({
                  	'value' => user.email,
                  	'type' => "user",
                  	'role' => "reader"
                })

            	result = client.execute(:api_method => drive.permissions.insert,
                    :body_object => new_permission,
            		:parameters => { 'fileId' => teamfile.file_id, 'emailMessage' => "Shared via monea.build within moneaTeam '#{team_name}' " })
              		
        end

	end
end
